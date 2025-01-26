```c
import { Shader } from "@/shadertoy-shader";

const main = /*glsl*/ `
#define t iTime
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 color = texture2D(iGBuffer0, uv);


    // Transform coordinates to screen space
    vec2 p = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y * mat2(8, -6, 6, 8);
    vec2 v;

    // Add noise based on time
    float f = 3.0 + hash12(p + vec2(t * 7.0, 0.0));

    // Main meteor effect loop
    for(float i = 0.0; i < 10.0; i++) {
        // Calculate meteor trail position
        v = p + cos(i * i + (t + p.x * 0.1) * 0.03 + i * vec2(11, 9)) * 5.0;

        // Accumulate color with trail effect
        vec4 color = (cos(sin(i) * vec4(1, 2, 3, 1)) + 1.0) * exp(sin(i * i + t));
        float trail = length(max(v, vec2(v.x * f * 0.02, v.y)));
        fragColor += color / trail;
    }

    // Apply final color adjustments
    fragColor = tanh(pow(fragColor / 100.0, vec4(1.5)));
}`;

const shader = new Shader();
shader.addMainPass(main);

export default shader;
```
