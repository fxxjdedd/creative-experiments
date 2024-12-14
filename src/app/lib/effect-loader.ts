import { ShaderToyRunner } from "../../shadertoy-runner";

export class EffectLoader {
  private runner: ShaderToyRunner | null = null;

  constructor(private container: HTMLCanvasElement) {
    // 监听窗口大小变化
    window.addEventListener("resize", this.resize.bind(this));
  }

  private resize() {
    if (this.runner) {
      this.runner.resize(
        this.container.clientWidth,
        this.container.clientHeight
      );
    }
  }

  async loadEffect(id: string) {
    try {
      // 清理之前的效果
      if (this.runner) {
        this.runner.dispose();
      }

      // 动态导入效果
      const module = await import(`../../experiments/${id}/index.ts`);
      const shaders = module.shaders;
      const textures = module.textures || [];

      // 创建新的效果，传入buffers作为第三个参数
      this.runner = new ShaderToyRunner(this.container, shaders, textures);
    } catch (error) {
      console.error("Failed to load effect:", error);
    }
  }

  play() {
    this.runner?.play();
  }

  pause() {
    this.runner?.pause();
  }

  reset() {
    this.runner?.reset();
  }

  dispose() {
    if (this.runner) {
      this.runner.dispose();
      this.runner = null;
    }
    window.removeEventListener("resize", this.resize);
  }
}
