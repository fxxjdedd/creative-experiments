import { Shader } from "@/shadertoy-shader";
import { ShaderToyRunner } from "../../shadertoy-runner";

export class EffectLoader {
  private runner: ShaderToyRunner | null = null;

  constructor(private container: HTMLCanvasElement) {
    // 监听窗口大小变化
    window.addEventListener("resize", this.resize.bind(this));
  }

  private resize() {
    if (this.runner) {
      this.runner.resize(this.container.clientWidth, this.container.clientHeight);
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
      const shader = module.default as Shader;

      // 创建新的效果
      this.runner = new ShaderToyRunner(this.container, shader);
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

  enableOrbitControls() {
    this.runner?.enableOrbitControls();
  }

  disableOrbitControls() {
    this.runner?.disableOrbitControls();
  }

  toggleCameraType() {
    this.runner?.toggleCameraType();
  }

  dispose() {
    if (this.runner) {
      this.runner.dispose();
      this.runner = null;
    }
    window.removeEventListener("resize", this.resize);
  }
}
