import * as THREE from "three";
import { VFX_UTILS } from "./shadertoy-utils";
import { BufferConfig, Shader } from "./shadertoy-shader";

export class ShaderToyRunner {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private uniforms: { [key: string]: THREE.IUniform };
  private startTime: number;
  private pauseTime: number = 0;
  private isPlaying: boolean = true;
  private animationFrameId: number | null = null;
  private textureLoader: THREE.TextureLoader;

  private bufferConfigs: BufferConfig[] = [];
  private currentFrame: number = 0;

  constructor(container: HTMLCanvasElement, shader: Shader) {
    this.scene = new THREE.Scene();
    this.textureLoader = new THREE.TextureLoader();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(1);
    this.renderer.autoClear = false;

    this.startTime = Date.now();

    // 基础uniforms
    this.uniforms = {
      iTime: { value: 0 },
      iResolution: {
        value: new THREE.Vector3(container.clientWidth, container.clientHeight, 1),
      },
      iMouse: { value: new THREE.Vector4() },
      iFrame: { value: 0 },
    };

    // 设置外部纹理uniforms
    const externalTextures = shader.getTextures();
    externalTextures.forEach((url, index) => {
      this.uniforms[`iChannel${index}`] = { value: null };
      this.textureLoader.load(url, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        this.uniforms[`iChannel${index}`].value = texture;
      });
    });

    // 解析所有shader并创建对应的缓冲区配置
    const bufferPasses = shader.getBufferPasses();
    const numBuffers = bufferPasses.length; // 最后一个shader是输出
    for (let i = 0; i < numBuffers; i++) {
      const { code, metadata, initialSubPass } = bufferPasses[i];

      // 创建主缓冲区和debug缓冲区
      const frontTarget = new THREE.WebGLRenderTarget(container.clientWidth, container.clientHeight, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        count: 2,
      });

      // 如果是可交换的，创建后缓冲区
      let backTarget = null;
      if (metadata.isSwappable) {
        backTarget = new THREE.WebGLRenderTarget(container.clientWidth, container.clientHeight, {
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
          count: 2,
        });
      }

      // 设置GBuffer uniforms - 主输出和debug输出
      this.uniforms[`iGBuffer${i}`] = {
        value: frontTarget.textures[0],
      };
      this.uniforms[`iGBufferDebug${i}`] = {
        value: frontTarget.textures[1],
      };
      if (metadata.isSwappable) {
        this.uniforms[`iBackBuffer`] = {
          value: backTarget!.textures[0],
        };
        this.uniforms[`iBackBufferDebug`] = {
          value: backTarget!.textures[1],
        };
      }

      // 创建材质和mesh
      const uniformsDeclaration = this.generateUniformsDeclaration(
        externalTextures.length,
        numBuffers,
        i,
        metadata.isSwappable
      );

      const mainFunction = `
        layout(location = 0) out vec4 fragColor;
        layout(location = 1) out vec4 fragColor1;
        void main() {
          fragColor1 = vec4(1.0, 0.0, 0.0, 1.0);
          mainImage(fragColor, gl_FragCoord.xy);
        }
      `;

      const processedShader =
        uniformsDeclaration +
        "\n" +
        VFX_UTILS +
        "\n" +
        code +
        (code.includes("void main()") ? "" : "\n" + mainFunction);

      const material = new THREE.ShaderMaterial({
        fragmentShader: processedShader,
        uniforms: this.uniforms,
        vertexShader:
          metadata.customVertexShader ||
          `
          out vec4 vPosition;
          void main() {
            gl_Position = vec4(position, 1.0);
            vPosition = gl_Position;
          }
        `,
        glslVersion: THREE.GLSL3,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);

      // 如果有初始化子pass，创建它的材质
      let initialMesh = null;
      if (initialSubPass) {
        const processedInitialShader =
          uniformsDeclaration +
          "\n" +
          VFX_UTILS +
          "\n" +
          initialSubPass +
          (initialSubPass.includes("void main()") ? "" : "\n" + mainFunction);

        const initialMaterial = new THREE.ShaderMaterial({
          fragmentShader: processedInitialShader,
          uniforms: this.uniforms,
          vertexShader:
            metadata.customVertexShader ||
            `
            out vec4 vPosition;
            void main() {
              gl_Position = vec4(position, 1.0);
              vPosition = gl_Position;
            }
          `,
          glslVersion: THREE.GLSL3,
        });
        initialMesh = new THREE.Mesh(geometry, initialMaterial);
      }

      this.bufferConfigs.push({
        metadata,
        frontTarget,
        backTarget,
        mesh,
        initialMesh,
        index: i,
        initialized: false,
      });
    }

    // 创建最终输出的mesh
    const mainPass = shader.getMainPass();
    if (!mainPass) {
      throw new Error("Main pass not found");
    }
    const finalMaterial = new THREE.ShaderMaterial({
      fragmentShader: this.processShader(mainPass.code, externalTextures.length, numBuffers),
      uniforms: this.uniforms,
      vertexShader:
        mainPass.metadata.customVertexShader ||
        `
        out vec4 vPosition;
        void main() {
          gl_Position = vec4(position, 1.0);
          vPosition = gl_Position;
        }
      `,
      glslVersion: THREE.GLSL3,
    });
    const finalMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMaterial);
    this.bufferConfigs.push({
      metadata: mainPass.metadata,
      frontTarget: null,
      backTarget: null,
      mesh: finalMesh,
      index: numBuffers,
    });

    // 添加最终mesh到场景
    this.scene.add(finalMesh);

    container.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.animate();
  }

  private generateUniformsDeclaration(
    numTextures: number,
    numBuffers: number,
    currentBuffer: number,
    isSwappable: boolean
  ): string {
    return `
      in vec4 vPosition;
      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec4 iMouse;
      uniform int iFrame;
      ${Array(numTextures)
        .fill(0)
        .map((_, i) => `uniform sampler2D iChannel${i};`)
        .join("\n")}
      ${Array(currentBuffer + 1)
        .fill(0)
        .map(
          (_, i) => `
          uniform sampler2D iGBuffer${i};
          uniform sampler2D iGBufferDebug${i};
        `
        )
        .join("\n")}
      ${
        isSwappable
          ? `
        uniform sampler2D iBackBuffer;
        uniform sampler2D iBackBufferDebug;
      `
          : ""
      }
    `;
  }

  private processShader(code: string, numTextures: number, numBuffers: number): string {
    const uniformsDeclaration = `
      in vec4 vPosition;
      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec4 iMouse;
      uniform int iFrame;
      ${Array(numTextures)
        .fill(0)
        .map((_, i) => `uniform sampler2D iChannel${i};`)
        .join("\n")}
      ${Array(numBuffers)
        .fill(0)
        .map(
          (_, i) => `
          uniform sampler2D iGBuffer${i};
          uniform sampler2D iGBufferDebug${i};
        `
        )
        .join("\n")}
    `;

    const mainFunction = `
      layout(location = 0) out vec4 fragColor;
      layout(location = 1) out vec4 fragColor1;
      void main() {
        fragColor1 = vec4(1.0, 0.0, 0.0, 1.0);
        mainImage(fragColor, gl_FragCoord.xy);
      }
    `;

    return (
      uniformsDeclaration + "\n" + VFX_UTILS + "\n" + code + (code.includes("void main()") ? "" : "\n" + mainFunction)
    );
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.uniforms.iMouse.value.x = event.clientX - rect.left;
    this.uniforms.iMouse.value.y = rect.height - (event.clientY - rect.top);
  }

  private animate(): void {
    if (!this.isPlaying) return;

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    this.uniforms.iTime.value = (Date.now() - this.startTime) * 0.001;
    this.uniforms.iFrame.value = this.currentFrame++;

    // 渲染每个中间缓冲区
    for (let i = 0; i < this.bufferConfigs.length - 1; i++) {
      const config = this.bufferConfigs[i];

      // 如果有初始化子pass且尚未初始化，先执行初始化
      if (config.initialMesh && !config.initialized) {
        this.scene.remove(this.scene.children[0]);
        this.scene.add(config.initialMesh);
        this.renderer.setRenderTarget(config.frontTarget);
        this.renderer.render(this.scene, this.camera);
        if (config.backTarget) {
          this.renderer.setRenderTarget(config.backTarget);
          this.renderer.render(this.scene, this.camera);
        }
        config.initialized = true;
      }

      // 如果是可交换的缓冲区，进行多次迭代
      if (config.metadata.isSwappable && config.backTarget) {
        for (let j = 0; j < config.metadata.iterationsPerFrame; j++) {
          // 先更新 uniform 指向当前的 back buffer
          this.uniforms[`iBackBuffer`].value = config.backTarget!.textures[0];
          this.uniforms[`iBackBufferDebug`].value = config.backTarget!.textures[1];

          // 渲染到 front buffer
          this.scene.remove(this.scene.children[0]);
          this.scene.add(config.mesh);
          this.renderer.setRenderTarget(config.frontTarget);
          this.renderer.render(this.scene, this.camera);

          // 交换 front 和 back buffer
          const temp = config.frontTarget;
          config.frontTarget = config.backTarget;
          config.backTarget = temp;

          // 更新 GBuffer uniform
          this.uniforms[`iGBuffer${config.index}`].value = config.frontTarget!.textures[0];
          this.uniforms[`iGBufferDebug${config.index}`].value = config.frontTarget!.textures[1];
        }
      } else {
        // 普通缓冲区只渲染一次
        this.scene.remove(this.scene.children[0]);
        this.scene.add(config.mesh);
        this.renderer.setRenderTarget(config.frontTarget);
        this.renderer.render(this.scene, this.camera);
      }
    }

    // 渲染最终输出
    this.scene.remove(this.scene.children[0]);
    this.scene.add(this.bufferConfigs[this.bufferConfigs.length - 1].mesh);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  public play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.startTime = Date.now() - this.pauseTime * 1000;
      this.animate();
    }
  }

  public pause(): void {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.pauseTime = this.uniforms.iTime.value;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  }

  public reset(): void {
    this.startTime = Date.now();
    this.pauseTime = 0;
    this.currentFrame = 0;
    if (!this.isPlaying) {
      this.play();
    }
  }

  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.uniforms.iResolution.value.set(width, height, 1);

    this.bufferConfigs.forEach((config) => {
      if (config.frontTarget) {
        config.frontTarget.setSize(width, height);
      }
      if (config.backTarget) {
        config.backTarget.setSize(width, height);
      }
    });
  }

  public dispose(): void {
    this.bufferConfigs.forEach((config) => {
      if (config.frontTarget) {
        config.frontTarget.dispose();
      }
      if (config.backTarget) {
        config.backTarget.dispose();
      }
      config.mesh.geometry.dispose();
      (config.mesh.material as THREE.ShaderMaterial).dispose();
    });

    for (const key in this.uniforms) {
      if (key.startsWith("iChannel") && this.uniforms[key].value instanceof THREE.Texture) {
        this.uniforms[key].value.dispose();
      }
    }

    this.renderer.dispose();
  }
}
