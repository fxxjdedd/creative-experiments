import { Shader } from "@/shadertoy-shader";

const main = /*glsl*/ `
void mainImage( out vec4 fragColor, in vec2 fragCoord, out vec4 debugColor)
{
    float a = 0.36;
    float b = 0.57;

    vec2 encodedA = encodeFloatToVec2(a);
    vec2 encodedB = encodeFloatToVec2(b);

    float decodedA = decodeVec2ToFloat(encodedA);
    float decodedB = decodeVec2ToFloat(encodedB);

    fragColor = vec4(vec3(decodedA, decodedB, 0.0), 1.0);
    // fragColor = vec4(vec3(a, b, 0.0), 1.0);
}

`;

const shader = new Shader();
shader.addMainPass(main);

export default shader;
