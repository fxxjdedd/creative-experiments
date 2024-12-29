import { Shader } from "@/shadertoy-shader";

const bufferAVertex = /*glsl*/ `
void main() {
    gl_Position = vec4(position, 1.0);
}`;

const bufferA = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 color = texture2D(iGBuffer0, uv);
    fragColor = vec4(color.xyz, 1.0);
}`;

const shader = new Shader();
shader.addGBufferPass(bufferA, { isSwappable: true, iterationsPerFrame: 1, customVertexShader: bufferAVertex });
shader.addMainPass(main);

export default shader;
