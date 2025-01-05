import { Shader } from "@/shadertoy-shader";
import { Vector2 as vec2, PlaneGeometry } from "three";

// ref: https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models

const buffer0 = /*glsl*/ `
#define MAX_COUNT 4
#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define t iTime*0.5

uniform int waveCount;
uniform float waveLength[MAX_COUNT];
uniform float waveAmplitude[MAX_COUNT];
uniform float waveSpeed[MAX_COUNT];
uniform vec2 waveDirection[MAX_COUNT];
uniform float waveSteepnesses[MAX_COUNT];

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    vec2 uv = fragCoord/iResolution.xy;
    uv *= 100.0;

    vec3 P = vec3(0.0);
    vec3 N = vec3(0.0);

    // compute position
    for (int i = 0; i < waveCount; i++) {
        float l = waveLength[i];
        float a = waveAmplitude[i];
        float s = waveSpeed[i];
        vec2 d = normalize(waveDirection[i]);
        float steepness = waveSteepnesses[i];

        float w = TWO_PI / l;
        float phi = s * w;
        float phase = phi * t;

        float wa = w * a;
        float q  = steepness / (wa * float(waveCount));
        float dt = dot(d, uv);
        float wdt = w * dt;
        float qa = q * a;

        // P(x,y,t)
        P.x += (qa * d.x * cos(wdt + phase));
        P.y += (qa * d.y * cos(wdt + phase));
        P.z += (a * sin(wdt + phase));

        // N
        N.x -= (d.x * wa * cos(wdt + phase));
        N.y -= (d.y * wa * cos(wdt + phase));
        N.z -= (q * wa * sin(wdt + phase));
    }

    N.z = 1.0 + N.z;

    fragColor = vec4(P, 1.0);
    debugColor = vec4(normalize(N), 1.0);
}`;

const mainVert = /*glsl*/ `
out vec2 v_uv;
out vec3 v_pos;
void main() {
    vec3 wavePosition = texture2D(iGBuffer0, uv).xyz; // z is height direction
    vec3 positionInView = (modelViewMatrix * vec4(position.xyz + wavePosition, 1.0)).xyz;
    gl_Position = projectionMatrix * vec4(positionInView, 1.0);
    v_uv = uv;
    v_pos = positionInView;
}`;

const mainFrag = /*glsl*/ `

#define PI 3.14159265359
#define TWO_PI 6.28318530718

in vec2 v_uv;
in vec3 v_pos;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 normal = texture2D(iGBufferDebug0, v_uv).xyz;
    mat4 normalMatrix = transpose(inverse(viewMatrix));
    vec3 normalInView = normalize(normalMatrix * vec4(normal, 1.0)).xyz;
    vec3 normalInWorld = normalize(normal);

    vec3 lightSource = vec3(0.5, 0.3, 1.0);

    vec3 wi = normalize(viewMatrix * vec4(lightSource, 1.0)).xyz;
    vec3 wo = normalize(-v_pos);
    vec3 wh = normalize(wi + wo);
    // sample env map in world space
    vec3 woInWorld = normalize(vec3(inverse(viewMatrix) * vec4(wo, 0.0)));

    vec3 reflectDir = reflect(-woInWorld, normalInWorld);
    vec2 sphereCoord = vec2(
        atan(reflectDir.z, reflectDir.x),
        acos(reflectDir.y)
    );

    vec2 envMapUV = vec2(
        sphereCoord.x/TWO_PI + 0.5, // phi range from 0 to 2pi
        sphereCoord.y/PI // theta range from 0 to pi
    );
    vec3 envColor = texture2D(envMap, envMapUV).rgb;

    float diffuse = max(dot(normalInView, wi), 0.0);
    float specular = pow(max(dot(normalInView, wh), 0.0), 32.0);


    vec3 r = envColor * (diffuse + 0.5 * specular);
    fragColor = vec4(r, 1.0);
}`;

const shader = new Shader();
shader.addGBufferPass(buffer0, {
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
shader.addMainPass(mainFrag, {
  customVertexShader: mainVert,
  customPlaneGeometry: new PlaneGeometry(100, 100, 200, 200),
});
shader.setEnvMap("/skybox/syferfontein_1d_clear_puresky_1k_blurred.exr");

export default shader;
