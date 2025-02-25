import "reflect-metadata";
import * as THREE from "three";

export interface ShaderPassOptions {
  isSwappable?: boolean;
  iterationsPerFrame?: number;
  customVertexShader?: string;
  customUniforms?: Record<string, THREE.IUniform>;
  customPlaneGeometry?: THREE.PlaneGeometry;
}

export class Shader {
  private bufferPasses: {
    code: string;
    initialSubPass?: string;
    metadata: Required<ShaderPassOptions>;
  }[] = [];
  private mainPass: {
    code: string;
    metadata: Required<ShaderPassOptions>;
  } | null = null;
  private textures: string[] = [];
  private envMap: string = "";

  addGBufferPass(code: string, options: ShaderPassOptions = {}, initialSubPass?: string) {
    this.bufferPasses.push({
      code,
      initialSubPass,
      metadata: {
        isSwappable: options.isSwappable ?? false,
        iterationsPerFrame: options.iterationsPerFrame ?? 1,
        customVertexShader: options.customVertexShader ?? "",
        customUniforms: options.customUniforms ?? {},
        customPlaneGeometry: options.customPlaneGeometry ?? new THREE.PlaneGeometry(2, 2),
      },
    });
  }

  addMainPass(code: string, options: Omit<ShaderPassOptions, "isSwappable" | "iterationsPerFrame"> = {}) {
    this.mainPass = {
      code,
      metadata: {
        isSwappable: false,
        iterationsPerFrame: 1,
        customVertexShader: options.customVertexShader ?? "",
        customUniforms: options.customUniforms ?? {},
        customPlaneGeometry: options.customPlaneGeometry ?? new THREE.PlaneGeometry(2, 2),
      },
    };
  }

  addTexture(texture: string) {
    this.textures.push(texture);
  }

  setEnvMap(envMap: string) {
    this.envMap = envMap;
  }

  getEnvMap() {
    return this.envMap;
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
  initialMesh?: THREE.Mesh | null; // 初始化子pass的mesh
  initialized?: boolean; // 标记是否已执行初始化
  index: number; // 用于生成正确的uniform名称
}
