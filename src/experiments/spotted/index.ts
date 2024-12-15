// ref: https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/

import { Shader } from "@/shadertoy-shader";

const bufferInitial = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord, out vec4 debugColor) {
    
}`;

const bufferA = /*glsl*/ `

const float RATE_U = 0.210;
const float RATE_V = 0.105;

const float FEED_U_MIN = 0.02220;
const float FEED_U_MAX = 0.04470;
const float KILL_V_MIN = 0.06516;
const float KILL_V_MAX = 0.05789;


vec4 encode(float U, float V) {
    return vec4(encodeFloatToVec2(U), encodeFloatToVec2(V));
}
vec2 decode(vec4 color) {
    return vec2(decodeVec2ToFloat(color.xy), decodeVec2ToFloat(color.zw));
}

mat3 laplaceKernel = mat3(
    0.05, 0.20, 0.05,
    0.20, -1.0, 0.20,
    0.05, 0.20, 0.05
);

vec2 computeLaplace(vec2 uv, float U, float V) {

    vec2 kernelCenter = vec2(U, V);
    vec2 discreteLaplace = vec2(0.0, 0.0);

    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            vec2 kernelPos = vec2(i - 1, j - 1);
            vec2 samplePos = uv + kernelPos*(1.0/iResolution.xy);
            vec4 sampleValue = texture(iBackBuffer, samplePos);
            vec2 sampleUV = decode(sampleValue);
            discreteLaplace += laplaceKernel[i][j] * sampleUV;
        }
    }

    return discreteLaplace;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord, out vec4 debugColor) {
    vec2 uv = fragCoord/iResolution.xy;
    // vec2 uv = (coord2uv(fragCoord) + 1.0) / 2.0;
    vec4 backColor = texture(iBackBuffer, uv);

    vec2 UV = decode(backColor);
    float U = UV.x;
    float V = UV.y;


    vec4 sampledChannel = vec4(0.0, 1.0, 0.0, 0.0);
    float mapValue = dot(sampledChannel, texture2D(iChannel0, uv));
    mapValue = sqrt(clamp(mapValue - 0.1, 0.0, 1.0));

    float feedU = mix(FEED_U_MIN, FEED_U_MAX, mapValue);
    float killV = mix(KILL_V_MIN, KILL_V_MAX, mapValue);

    vec2 laplace = computeLaplace(uv, U, V);
    float reactionPossibility = U * V * V;

    float dt = 0.01;

    float nextU = U + dt*(RATE_U*laplace.x - reactionPossibility + feedU*(1.0 - U));
    float nextV = V + dt*(RATE_V*laplace.y + reactionPossibility - (killV + feedU)*V);

    vec4 nextColor = encode(nextU, nextV);

    fragColor = nextColor;
    // debugColor = vec4(reactionPossibility,0.0, 0.0, 1.0);
}`;

const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord, out vec4 debugColor) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 original = texture2D(iGBuffer0, uv);  // Buffer A的原始结果
    vec2 decoded = vec2(decodeVec2ToFloat(original.xy), decodeVec2ToFloat(original.zw));

    float v = step(0.2, decoded.x);
    float color = step(0.2, v);
    
    fragColor = vec4(vec3(color), 1.0);
}`;

const shader = new Shader();
shader.addGBufferPass(bufferA, { isSwappable: true, iterationsPerFrame: 5 });
shader.addMainPass(main);
shader.addTexture("/textures/avatar.png");

export default shader;
