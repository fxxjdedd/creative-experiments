import { Shader } from "@/shadertoy-shader";

const main = /*glsl*/ `
#define t iTime*100.0
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - iResolution.xy*0.5)/min(iResolution.x, iResolution.y);

    uv = rotate2d(deg2rad(-30.0)) * uv;

    uv *= 30.0;

    // 等价于上方的if-else
    float noiseScale = hash12(uv + vec2(t * 6.0, 0.0));

    vec4 color = vec4(0.0);
    for(float i = 0.0; i < 5.0; i++) {

        vec2 aniUV = uv + 10.0*cos(i*i + i* vec2(1.0, 5.0)*10.0 + (t + uv.x) * 0.001);

        float tail = length(max(aniUV, vec2(aniUV.x * noiseScale * 0.03, aniUV.y)));
        vec4 col = vec4(0.8, 0.2, 0.1, 1.0)*exp(sin(i*i+t*0.01));
        color +=  col / tail;
    }

    fragColor = pow(color/10.0, vec4(1.5));

}`;

const shader = new Shader();
shader.addMainPass(main);

export default shader;
