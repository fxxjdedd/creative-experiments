import * as THREE from "three";
import { VFX_UTILS } from "./shadertoy-utils";

export class ShaderToyRunner {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private uniforms: { [key: string]: THREE.IUniform };
  private mesh: THREE.Mesh;
  private startTime: number;
  private pauseTime: number = 0;
  private isPlaying: boolean = true;
  private animationFrameId: number | null = null;
  private textureLoader: THREE.TextureLoader;

  constructor(
    container: HTMLCanvasElement,
    fragmentShader: string,
    textureList: string[] = []
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
    this.renderer.setPixelRatio(1); // 设置为1以匹配container尺寸

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
    };

    // Create empty textures first and add them to uniforms
    textureList.forEach((_, index) => {
      this.uniforms[`iChannel${index}`] = { value: null };
    });

    // Then load textures and update them when ready
    textureList.forEach((url, index) => {
      this.textureLoader.load(url, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        this.uniforms[`iChannel${index}`].value = texture;
      });
    });

    // ShaderToy uniforms declaration
    const uniformsDeclaration = `
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
${textureList.map((_, i) => `uniform sampler2D iChannel${i};`).join("\n")}
    `;

    // Inject utility functions and main function into shader code
    const mainFunction = `
void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}`;
    const processedShader =
      uniformsDeclaration +
      "\n" +
      VFX_UTILS +
      "\n" +
      (fragmentShader.includes("void main()")
        ? fragmentShader
        : fragmentShader + "\n" + mainFunction);

    // Create shader material
    const material = new THREE.ShaderMaterial({
      fragmentShader: processedShader,
      uniforms: this.uniforms,
      vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
    });

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

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

    // Render
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
    if (!this.isPlaying) {
      this.play();
    }
  }

  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.uniforms.iResolution.value.set(width, height, 1);
  }

  public dispose(): void {
    // Dispose textures
    for (const key in this.uniforms) {
      if (
        key.startsWith("iChannel") &&
        this.uniforms[key].value instanceof THREE.Texture
      ) {
        this.uniforms[key].value.dispose();
      }
    }
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.ShaderMaterial).dispose();
    this.renderer.dispose();
  }
}
