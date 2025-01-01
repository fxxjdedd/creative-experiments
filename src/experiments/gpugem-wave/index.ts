import { Shader } from "@/shadertoy-shader";
import { Vector2 as vec2, PlaneGeometry } from "three";

const bufferAVertex = /*glsl*/ `
#define MAX_COUNT 4
#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform int waveCount;
uniform float waveLength[MAX_COUNT];
uniform float waveAmplitude[MAX_COUNT];
uniform float waveSpeed[MAX_COUNT];
uniform vec2 waveDirection[MAX_COUNT];
uniform float waveSteepnesses[MAX_COUNT];

out vec4 vPos;
out vec3 vNormal;

void main() {

    vec2 planeCoord = position.xy;

    vPos = vec4(vec3(0.0), 1.0);
    vNormal = normal.xyz;

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
        float dt = dot(d, planeCoord);
        float wdt = w * dt;
        float qa = q * a;

        // P(x,y,t)
        vPos.x += (qa * d.x * cos(wdt + phase));
        vPos.y += (qa * d.y * cos(wdt + phase));
        vPos.z += (a * sin(wdt + phase));
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const bufferA = /*glsl*/ `
in vec4 vPos;
in vec3 vNormal;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = vPos;
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
  customVertexShader: bufferAVertex,
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
  customPlaneGeometry: new PlaneGeometry(100, 100, 200, 200),
});
shader.addMainPass(main);

export default shader;
