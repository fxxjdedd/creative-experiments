export const main = /*glsl*/ `
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float a = 0.5;
    float b = 0.5;

    vec2 encodedA = encodeFloatToVec2(a);
    vec2 encodedB = encodeFloatToVec2(b);

    float decodedA = decodeVec2ToFloat(encodedA);
    float decodedB = decodeVec2ToFloat(encodedB);

    fragColor = vec4(vec3(decodedA, decodedB, 0.0), 1.0);
    // fragColor = vec4(vec3(0.5, 0.5, 0.0), 1.0);
}

`;

export const shaders = [main];
export const textures = [];
