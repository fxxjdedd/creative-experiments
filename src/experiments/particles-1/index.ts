import { Shader } from "@/shadertoy-shader";

const bufferA = /*glsl*/ `
#define PI2 6.28318530718
#define t iTime*0.5
#define PARTICLE_COUNT 400.0

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 标准化UV坐标，使其以屏幕中心为原点
    vec2 uv = (fragCoord - iResolution.xy * 0.5) / min(iResolution.x, iResolution.y);
    
    // 初始化输出颜色
    vec3 color = vec3(0.0);
    
    // 计算基于屏幕分辨率的归一化坐标
    vec2 p = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y * 0.8;
    
    // 添加背景纹理
    for(float i = 0.0; i < PARTICLE_COUNT; i++) {
        // 计算粒子位置
        vec2 particlePos = mod(
            t / 9.0 + tan(i / PARTICLE_COUNT) + 1.0,
            0.35
        ) * sin(
            i + PI2 * vec2(0.0, 0.25) + 
            0.1 * normalize(vec2(i, 0.1 * t + 1.0))
        );
        
        // 计算到粒子的距离
        float dist = exp(0.47 - length(particlePos));
        
        // 添加粒子颜色贡献
        color += vec3(
            0.0,                                      // R
            0.0,                                      // G
            0.6 * exp(-200.0 * (dist + 0.04) *       // B
                length(p - particlePos))
            
        );
    }

    // 最终颜色调整
    fragColor = vec4(color, 1.0);
}
`;

const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 original = texture2D(iGBuffer0, uv);  // Buffer A的原始结果
    fragColor = vec4(vec3(original.z), 1.0);
}`;

const shader = new Shader();
shader.addGBufferPass(bufferA);
shader.addMainPass(main);

export default shader;
