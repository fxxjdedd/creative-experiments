import "reflect-metadata";
import * as THREE from "three";

export interface ShaderPassOptions {
  isSwappable?: boolean;
  iterationsPerFrame?: number;
  runOnce?: boolean;
}

export class Shader {
  private bufferPasses: {
    code: string;
    metadata: Required<ShaderPassOptions>;
  }[] = [];
  private mainPass: {
    code: string;
    metadata: Required<ShaderPassOptions>;
  } | null = null;
  private textures: string[] = [];
  addGBufferPass(code: string, options: ShaderPassOptions = {}) {
    this.bufferPasses.push({
      code,
      metadata: {
        isSwappable: options.isSwappable ?? false,
        iterationsPerFrame: options.iterationsPerFrame ?? 1,
        runOnce: options.runOnce ?? false,
      },
    });
  }

  addMainPass(code: string) {
    this.mainPass = {
      code,
      metadata: {
        isSwappable: false,
        iterationsPerFrame: 1,
        runOnce: false,
      },
    };
  }

  addTexture(texture: string) {
    this.textures.push(texture);
  }

  getBufferPasses() {
    return this.bufferPasses;
  }

  getMainPass() {
    return this.mainPass;
  }

  getTextures() {
    return this.textures;
  }
}

export interface BufferConfig {
  metadata: Required<ShaderPassOptions>;
  frontTarget: THREE.WebGLRenderTarget | null; // 主buffer是null
  backTarget: THREE.WebGLRenderTarget | null;
  mesh: THREE.Mesh;
  index: number; // 用于生成正确的uniform名称
}