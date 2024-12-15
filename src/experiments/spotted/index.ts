// Buffer A: 生成一个简单的圆形
export const bufferA = `
@swappable 5
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float circle = smoothstep(0.3, 0.29, dist);
    fragColor = vec4(vec3(circle), 1.0);
}`;

// Buffer B: 对Buffer A的结果进行模糊处理
export const bufferB = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec2 texel = 1.0 / iResolution.xy;
    
    vec4 blur = vec4(0.0);
    float total = 0.0;
    
    for(float x = -2.0; x <= 2.0; x++) {
        for(float y = -2.0; y <= 2.0; y++) {
            vec2 offset = vec2(x, y) * texel;
            float weight = 1.0 - length(offset) * 0.5;
            if(weight <= 0.0) continue;
            blur += texture(iGBuffer0, uv + offset) * weight;
            total += weight;
        }
    }
    
    fragColor = blur / total;
}`;

// Main: 最终合成
export const main = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 original = texture(iGBuffer0, uv);  // Buffer A的原始结果
    vec4 blurred = texture(iGBuffer1, uv);   // Buffer B的模糊结果
    
    // 简单混合原始图和模糊图
    fragColor = mix(original, blurred, 0.5);
}`;

export const shaders = [bufferA, bufferB, main];
export const textures = [];
