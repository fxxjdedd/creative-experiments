// ref: https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/

import { Shader } from "@/shadertoy-shader";

const bufferA = /*glsl*/ `
#define t iTime
#define N 40
void mainImage(out vec4 fragColor, in vec2 fragCoord, out vec4 debugColor) {
    vec2 uv = fragCoord/iResolution.xy;

    float c = texture(iChannel0, uv).r;
    c = (0.8 * c - 0.25); // 调整亮度


    float b = 2.0 * t;

    float f = (1.6 - 1.4* c) / iResolution.x; // 调整kernel
    float s = 3.0;
    float a = 0.0;
    for (int i = 0; i < N; i++) {
        // U和V的迭代
        float value = s * texture(iBackBuffer, uv + (6.8 - s) * f * vec2(sin(b), cos(b))).a;
        a += value;
        b += 2.4;
        s *= -1.0;
    }
    a /= float(N);
    a = clamp(a + 0.5 - c, 0.0, 1.0);

    fragColor = vec4(0.,0.,0.,a);
}`;

const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord, out vec4 debugColor) {
    vec2 uv = fragCoord/iResolution.xy;
    float a = texture2D(iGBuffer0, uv).a;

    fragColor = vec4(vec3(1.0 - a), 1.0);
    
}`;

const shader = new Shader();
shader.addGBufferPass(bufferA, { isSwappable: true, iterationsPerFrame: 3 });
shader.addMainPass(main);
shader.addTexture("/textures/avatar.png");

export default shader;
