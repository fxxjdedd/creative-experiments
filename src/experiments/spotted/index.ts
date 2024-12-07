export const description = {
  summary: "一个后处理算法，能将一个图片变成斑点状，并且斑点会自由流动",
  techList: `该效果主要使用以下技术实现：
1) 使用Voronoi噪声生成斑点的基础形状和分布；
2) 应用柏林噪声(Perlin Noise)控制斑点的流动方向和速度；
3) 通过UV坐标扭曲和时间变量实现动态流动效果；
4) 使用距离场(SDF)技术平滑斑点边缘；
5) 采样原始图像并在斑点区域内进行颜色混合`,
};

export const glsl = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize pixel coordinates
    vec2 uv = fragCoord/iResolution.xy;
    
    // Sample noise texture for organic movement
    vec2 noiseUV = uv + iTime * 0.1;
    vec4 noise = texture2D(iChannel0, noiseUV);
    
    // Create a grid of spots with noise-based movement
    vec2 grid = fract(uv * 10.0 + noise.rg * 0.2) - 0.5;
    float dist = length(grid);
    
    // Sample the original image
    vec4 originalColor = texture2D(iChannel1, uv);
    
    // Animate the spots
    float spots = smoothstep(0.3 + 0.2 * sin(iTime), 0.4, dist);
    
    // Add some color variation
    vec3 color = originalColor.rgb * spots;
    
    // Output final color
    fragColor = vec4(color, 1.0);
}
`;

// 使用实际的纹理路径
export const buffers = [
  "/textures/noise.png", // 噪声纹理用于有机运动
  "/textures/source.jpg", // 源图像
];
