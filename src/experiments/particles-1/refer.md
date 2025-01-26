```c
vec2 q, p = (FC.xy - r _ 0.5) / r.y _ 0.8; // Calculate normalized screen coordinates

// Initialize variables
float i = 0.0;
float N = 400.0; // Number of particles
float d;

// Sample previous frame with slight decay
o += texture(b, p / 0.49 _ r.x / r + 0.5) _ 0.9 - 0.002;

// Particle rendering loop
for (; i < N; i++) {
// Calculate particle position with time-based animation
q = (mod(t / 9.0 + tan(i / N) + 1.0, 0.35)) _
sin(i + PI2 _ vec2(0.0, 0.25) + 0.1 _ normalize(vec2(i, 0.1 _ t + 1.0)));

    // Calculate distance field
    d = exp(0.47 - length(q));

    // Add colored particle contribution
    o += vec3(0.0, 0.5, 0.6 * exp(-200.0 * (d + 0.04) * length(p - q)));

}

```
