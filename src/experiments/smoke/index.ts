import { Shader } from "@/shadertoy-shader";

const bufferA = /*glsl*/ `
#define t iTime
#define N 40
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float noiseValue, gradientStrength, hash;
    vec2 uv, velocity;
    vec3 noise, normal;
    vec4 color, backColor;

    uv = fragCoord/iResolution.xy;

    // noise = hash33(vec3(uv, t));
    noise = fract(0.123456 * vec3(uv, t));
    noise += dot(noise, noise.yzx + 654.321);
    hash = fract((noise.x + noise.y) * noise.z);

    // 梯度
    gradientStrength = 0.1 + hash;

    // screen space的方向 + z梯度
    normal = normalize(vec3(
        texture(iBackBuffer, uv).r - vec2(
            texture(iBackBuffer, uv + vec2(gradientStrength, 0)).r,
            texture(iBackBuffer, uv + vec2(0, gradientStrength)).r
        ),
        gradientStrength
    ));

    // 衰减
    noiseValue = 1.0 - abs(uv.x - .5) * 2.0;
    color.x = noiseValue * smoothstep(0.01, 0.0, uv.y);


    // smoke运动
    noise = 9.0 * vec3(uv, t);
    noiseValue = 1.5 * dot(sin(2.0 * noise), cos(2.0 * noise.yzx))
        + 0.5 * dot(sin(6.0 * noise), cos(6.0 * noise.yzx));
    velocity = -0.5 * vec2(cos(noiseValue), sin(noiseValue)) * (1.0 - uv.y);
    velocity -= normal.xy * uv.y;
    velocity -= vec2(uv.y * sin(5.0 * uv.y + 0.5 * t), 1.0 - uv.y);
    backColor = texture(iBackBuffer, uv + 0.015 * (velocity) * noiseValue);
    noiseValue = smoothstep(0.0, 0.01, uv.y);
    color.x = mix(1.0, 0.98 * backColor.x, noiseValue);
    color.w = mix(fract(0.3 + 0.4 * uv.x + 0.1 * sin(1.0 * t) + 0.1 * sin(30.0 * uv.x)), backColor.w, noiseValue);

    fragColor = color;
}`;

const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 color = texture2D(iGBuffer0, uv);

    fragColor = vec4(color.xyz, 1.0);
    
}`;

const shader = new Shader();
shader.addGBufferPass(bufferA, { isSwappable: true, iterationsPerFrame: 1 });
shader.addMainPass(main);

export default shader;
