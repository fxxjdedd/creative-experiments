import * as THREE from "three";
import { VFX_UTILS } from "./shadertoy-utils";

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

  private bufferTextures: THREE.WebGLRenderTarget[] = [];
  private bufferMeshes: THREE.Mesh[] = [];
  private currentFrame: number = 0;

  constructor(
    container: HTMLCanvasElement,
    shaders: string[], // 改为接收shader数组
    textureList: string[] = [] // 只包含外部纹理
  ) {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.textureLoader = new THREE.TextureLoader();

    // Setup camera
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(1);

    // Initialize time
    this.startTime = Date.now();

    // Setup uniforms
    this.uniforms = {
      iTime: { value: 0 },
      iResolution: {
        value: new THREE.Vector3(
          container.clientWidth,
          container.clientHeight,
          1
        ),
      },
      iMouse: { value: new THREE.Vector4() },
      iFrame: { value: 0 },
    };

    // Create render targets for all intermediate buffers
    const numBuffers = Math.max(0, shaders.length - 1); // 最后一个shader直接输出到屏幕
    for (let i = 0; i < numBuffers; i++) {
      const renderTarget = new THREE.WebGLRenderTarget(
        container.clientWidth,
        container.clientHeight,
        {
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        }
      );
      this.bufferTextures.push(renderTarget);

      // Add the buffer texture as a channel
      this.uniforms[`iChannel${textureList.length + i}`] = {
        value: renderTarget.texture,
      };
    }

    // Setup external textures
    textureList.forEach((url, index) => {
      this.uniforms[`iChannel${index}`] = { value: null };
      this.textureLoader.load(url, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        this.uniforms[`iChannel${index}`].value = texture;
      });
    });

    // Create shader materials and meshes for each pass
    shaders.forEach((shaderCode, index) => {
      const uniformsDeclaration = `
        uniform float iTime;
        uniform vec3 iResolution;
        uniform vec4 iMouse;
        uniform float iFrame;
        ${Array(textureList.length + numBuffers)
          .fill(0)
          .map((_, i) => `uniform sampler2D iChannel${i};`)
          .join("\n")}
      `;

      const mainFunction = `
        void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
        }
      `;

      const processedShader =
        uniformsDeclaration +
        "\n" +
        VFX_UTILS +
        "\n" +
        shaderCode +
        (shaderCode.includes("void main()") ? "" : "\n" + mainFunction);

      const material = new THREE.ShaderMaterial({
        fragmentShader: processedShader,
        uniforms: this.uniforms,
        vertexShader: `
          void main() {
            gl_Position = vec4(position, 1.0);
          }
        `,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      this.bufferMeshes.push(mesh);
    });

    // Add the final mesh to the scene
    this.scene.add(this.bufferMeshes[this.bufferMeshes.length - 1]);

    // Setup mouse events
    container.addEventListener("mousemove", this.onMouseMove.bind(this));

    // Start animation
    this.animate();
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.uniforms.iMouse.value.x = event.clientX - rect.left;
    this.uniforms.iMouse.value.y = rect.height - (event.clientY - rect.top);
  }

  private animate(): void {
    if (!this.isPlaying) return;

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Update uniforms
    this.uniforms.iTime.value = (Date.now() - this.startTime) * 0.001;
    this.uniforms.iFrame.value = this.currentFrame++;

    // Render each intermediate buffer
    for (let i = 0; i < this.bufferTextures.length; i++) {
      this.scene.remove(this.scene.children[0]);
      this.scene.add(this.bufferMeshes[i]);

      this.renderer.setRenderTarget(this.bufferTextures[i]);
      this.renderer.render(this.scene, this.camera);
    }

    // Render final pass to screen
    this.scene.remove(this.scene.children[0]);
    this.scene.add(this.bufferMeshes[this.bufferMeshes.length - 1]);
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

    this.bufferTextures.forEach((buffer) => {
      buffer.setSize(width, height);
    });
  }

  public dispose(): void {
    this.bufferTextures.forEach((buffer) => buffer.dispose());

    this.bufferMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
    });

    for (const key in this.uniforms) {
      if (
        key.startsWith("iChannel") &&
        this.uniforms[key].value instanceof THREE.Texture
      ) {
        this.uniforms[key].value.dispose();
      }
    }

    this.renderer.dispose();
  }
}
