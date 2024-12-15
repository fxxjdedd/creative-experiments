import * as THREE from "three";

interface ShaderMetadata {
  isSwappable: boolean;
  iterationsPerFrame: number;
  code: string;
}

export function parseShader(shaderCode: string): ShaderMetadata {
  const metadata: ShaderMetadata = {
    isSwappable: false,
    iterationsPerFrame: 1,
    code: shaderCode,
  };

  // 查找特殊注释（现在在GLSL字符串内部查找）
  const swappableMatch = shaderCode.match(/@swappable\s*(\d+)/);
  if (swappableMatch) {
    metadata.isSwappable = true;
    metadata.iterationsPerFrame = parseInt(swappableMatch[1]) || 1;
    // 从代码中删除@swappable标记
    metadata.code = shaderCode.replace(/@swappable\s*(\d+)/g, "");
  }

  return metadata;
}

export interface BufferConfig {
  metadata: ShaderMetadata;
  frontTarget: THREE.WebGLRenderTarget | null; // 主buffer是null
  backTarget: THREE.WebGLRenderTarget | null;
  mesh: THREE.Mesh;
  index: number; // 用于生成正确的uniform名称
}
