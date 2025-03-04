// Common VFX utility functions
export const VFX_UTILS = /*glsl*/ `
// Noise functions
float hash12(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}
vec3 hash33(vec3 p) {
    p = fract(p * vec3(.1031, .1030, .0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.xxy + p.yzz) * p.zyx);
}

// Rotation utilities
mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

// UV manipulation
vec2 polarCoords(vec2 uv, vec2 center) {
    vec2 delta = uv - center;
    float radius = length(delta);
    float angle = atan(delta.y, delta.x);
    return vec2(radius, angle);
}

// Color utilities
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Smoothing and easing
float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// Angle conversions
float deg2rad(float deg) {
    return deg * 3.14159265359 / 180.0;
}

float rad2deg(float rad) {
    return rad * 180.0 / 3.14159265359;
}

vec2 coord2uv(vec2 fragCoord) {
    return (fragCoord * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
}

vec2 encodeFloatToVec2(float f) {
    float scaled = 255.0 * clamp(f, 0.0, 1.0);
    return vec2(floor(scaled) / 255.0, fract(scaled));
}

float decodeVec2ToFloat(vec2 v) {
    return v.x + v.y / 255.0;
}
`;
