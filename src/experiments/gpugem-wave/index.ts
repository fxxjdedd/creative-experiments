import { Shader } from "@/shadertoy-shader";
import { Vector2 as vec2, PlaneGeometry } from "three";

// ref: https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models

const bufferA = /*glsl*/ `
#define MAX_COUNT 4
#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform int waveCount;
uniform float waveLength[MAX_COUNT];
uniform float waveAmplitude[MAX_COUNT];
uniform float waveSpeed[MAX_COUNT];
uniform vec2 waveDirection[MAX_COUNT];
uniform float waveSteepnesses[MAX_COUNT];

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    vec2 uv = fragCoord/iResolution.xy;
    uv *= 200.0;
    vec3 P = vec3(0.0);

    for (int i = 0; i < waveCount; i++) {

        float l = waveLength[i];
        float a = waveAmplitude[i];
        float s = waveSpeed[i];
        vec2 d = normalize(waveDirection[i]);
        float steepness = waveSteepnesses[i];

        float w = TWO_PI / l;
        float phi = s * w;
        float phase = phi * iTime;

        float wa = w * a;
        float q  = steepness / (wa * float(waveCount));
        float dt = dot(d, uv);
        float wdt = w * dt;
        float qa = q * a;

        // P(x,y,t)
        P.x += (qa * d.x * cos(wdt + phase));
        P.y += (qa * d.y * cos(wdt + phase));
        P.z += (a * sin(wdt + phase));
    }
    fragColor = vec4(P, 1.0);
}`;

const main = /*glsl*/ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 color = texture2D(iGBuffer0, uv);
    fragColor = vec4(color.xyz, 1.0);
}`;

const shader = new Shader();
shader.addGBufferPass(bufferA, {
  isSwappable: true,
  iterationsPerFrame: 1,
  customUniforms: {
    waveCount: { value: 4 },
    waveLength: { value: [14, 6, 4, 3] },
    waveAmplitude: { value: [1, 0.2, 0.02, 0.05] },
    waveSpeed: { value: [7, 10, 2, 2.6] },
    waveDirection: {
      value: [
        new vec2(Math.cos((162 * Math.PI) / 180), Math.sin((162 * Math.PI) / 180)),
        new vec2(Math.cos((185.3 * Math.PI) / 180), Math.sin((185.3 * Math.PI) / 180)),
        new vec2(Math.cos((315 * Math.PI) / 180), Math.sin((315 * Math.PI) / 180)),
        new vec2(Math.cos((194 * Math.PI) / 180), Math.sin((194 * Math.PI) / 180)),
      ],
    },
    waveSteepnesses: { value: [0.25, 0.3, 0.6, 0.7] },
  },
});
shader.addMainPass(main);

export default shader;
