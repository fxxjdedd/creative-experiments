// ref: https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/

export const bufferA = /*glsl*/ `

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


@swappable 5
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (coord2uv(fragCoord) + 1.0) / 2.0;
    vec4 backColor = texture(iBackBuffer, uv);

    vec2 UV = decode(backColor);
    float U = UV.x;
    float V = UV.y;


    vec4 sampledChannel = vec4(0.0, 1.0, 0.0, 0.0);
    float mapValue = dot(sampledChannel, texture2D(iChannel0, uv));
    mapValue = sqrt(clamp(mapValue - 0.1, 0.0, 1.0));
    // mapValue = texture2D(iChannel0, uv).r;

    // float feedA = mix(0.02220, 0.04470, mapValue);
    // float killB = mix(0.06516, 0.05789, mapValue);
    // float diffuseA = 0.210;
    // float diffuseB = 0.105;

    float feedU = mix(FEED_U_MIN, FEED_U_MAX, mapValue);
    float killV = mix(KILL_V_MIN, KILL_V_MAX, mapValue);


    float reactionPossibility = U * V * V;
    vec2 laplace = computeLaplace(uv, U, V);

    float nextU = U + RATE_U*laplace.x - reactionPossibility + feedU*(1.0 - U);
    float nextV = V + RATE_V*laplace.y + reactionPossibility - (killV + feedU)*V;



    vec4 nextColor = encode(nextU, nextV);

    fragColor = nextColor;
    // fragColor = vec4(vec2(laplace), 1.0, 1.0);
}`;

export const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 original = texture(iGBuffer0, uv);  // Buffer A的原始结果
    // vec2 decoded = vec2(decodeVec2ToFloat(original.xy), decodeVec2ToFloat(original.zw));
    // vec4 circle = vec4(vec2(decoded.x, decoded.y), 0.0, 1.0);
    
    // 简单混合原始图和模糊图
    fragColor = vec4(vec3(original.b), 1.0);
}`;

export const shaders = [bufferA, main];
export const textures = ["/textures/avatar.png"];
