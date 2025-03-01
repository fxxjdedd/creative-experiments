// ref: https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/

import { Shader } from "@/shadertoy-shader";

const main = /*glsl*/ `
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define PI 3.14159

// Meteor effect
vec3 meteorEffect(vec2 uv, float time) {
    vec3 meteorColor = vec3(0.0);
    
    for(float i = 0.0; i < 3.0; i++) {
        float randomOffset = hash12(vec2(i, floor(time))) * 10.0;
        float meteorTime = time + randomOffset;
        float cycleTime = fract(meteorTime * 0.2);
        
        if(cycleTime < 0.15) {
            float progress = cycleTime / 0.15;
            
            // Expanded random start position in left-upper area
            vec2 randPos = vec2(
                hash12(vec2(floor(meteorTime), i)),           // 0~1
                hash12(vec2(floor(meteorTime), i + 42.0))     // 0~1
            );
            
            // Map random values to wider area in left-upper region
            vec2 startPos = vec2(
                mix(-1.6, -0.8, randPos.x),  // Wider x range
                mix(0.6, 1.2, randPos.y)      // Wider y range
            );
            
            // Random end position but maintain general direction
            vec2 dirVar = vec2(
                mix(1.8, 2.2, hash12(vec2(floor(meteorTime), i + 123.0))),
                mix(-1.7, -1.3, hash12(vec2(floor(meteorTime), i + 456.0)))
            );
            
            vec2 endPos = startPos + dirVar;
            vec2 pos = mix(startPos, endPos, progress);
            vec2 dir = normalize(endPos - startPos);
            
            vec2 toUV = uv - pos;
            float projDist = dot(toUV, dir);
            vec2 projPoint = pos + dir * max(-0.12, min(0.0, projDist));
            vec2 perpVec = uv - projPoint;
            
            float dist = length(perpVec) * 180.0;
            float alongDist = length(toUV) * 4.0;
            float trail = exp(-dist) * exp(-alongDist);
            
            trail *= (1.0 + 0.15 * sin(projDist * 40.0));
            
            float core = exp(-dist * 3.0) * exp(-alongDist * 0.8);
            
            float fade = pow(1.0 - progress, 1.8);
            trail *= fade;
            core *= fade;
            
            vec3 trailColor = mix(vec3(0.3, 0.6, 1.0), vec3(0.9), trail);
            vec3 coreColor = vec3(0.95, 0.9, 0.85);
            
            meteorColor += trail * 0.4 * trailColor + core * 1.2 * coreColor;
        }
    }
    
    return meteorColor;
}

// Hash function for random stars
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Create stars effect
vec3 stars(vec2 uv, float time) {
    vec3 color = vec3(0.0);
    
    // Layer 1: Dense small stars
    float star = hash(uv * 50.0);
    star = pow(star, 30.0);
    color += star * 0.3;
    
    // Layer 2: Scattered brighter stars
    float star2 = hash(uv * 20.0 + 0.1);
    star2 = pow(star2, 70.0);
    color += star2 * 0.5;
    
    // Layer 3: Twinkling stars
    float star3 = hash(uv * 10.0 + sin(time * 0.1));
    star3 = pow(star3, 90.0);
    color += star3 * vec3(0.8, 0.9, 1.0);
    
    return color;
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float getDist(vec3 p) {
  float sphereDist = sdSphere(p, 2.0);
  return sphereDist;
}

vec3 getNormal(vec3 p) {
  float d = getDist(p);
  vec2 e = vec2(0.01, 0);
  vec3 n = d - vec3(
    getDist(p - e.xyy),
    getDist(p - e.yxy),
    getDist(p - e.yyx)
  );
  return normalize(n);
}

float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.0;
  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = getDist(p);
    dO += dS;
    if(dO > MAX_DIST || dS < SURF_DIST) break;
  }
  return dO;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord.xy - iResolution.xy/2.0)/iResolution.y;

    vec3 ro = vec3(-1.5, 1.5, -3.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    float d = rayMarch(ro, rd);
    vec3 color;
    if(d < MAX_DIST) {
        vec3 pos = ro + rd * d;
        vec3 normal = getNormal(pos);

        // Add axial tilt
        float tiltAngle = -13.5 * PI / 180.0;
        mat3 tiltMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, cos(tiltAngle), -sin(tiltAngle),
            0.0, sin(tiltAngle), cos(tiltAngle)
        );
        normal = tiltMatrix * normal;

        float theta = atan(length(normal.xz), normal.y) / PI;
        theta = (theta + 1.0) / 2.0;
        theta *= 2.0;
        theta = 1.0 - theta;
        
        // Add rotation based on time
        float rotationSpeed = 0.01;
        float rotation = iTime * rotationSpeed;
        float phi = atan(normal.x, normal.z) / PI;
        phi = (phi + 1.0) / 2.0;
        phi = fract(phi + rotation);
        
        vec2 sphereUv = vec2(-(phi+0.3*PI), theta);

        // Sample normal map and convert to world space
        vec3 normalMap = texture2D(iChannel1, sphereUv).xyz * 2.0 - 1.0;
        
        // Create TBN matrix for normal mapping
        vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
        vec3 bitangent = normalize(cross(normal, tangent));
        mat3 TBN = mat3(tangent, bitangent, normal);
        
        // Apply normal map
        normal = normalize(TBN * normalMap);

        vec3 texColor = texture2D(iChannel0, sphereUv).rgb;
        float specularIntensity = texture2D(iChannel2, sphereUv).r; // Sample specular map
        
        // Enhance city lights while keeping dark areas dark
        float luminance = dot(texColor, vec3(0.299, 0.587, 0.114));
        float lightIntensity = pow(luminance, 1.0);
        
        // Add directional light with normal mapping
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float ambient = 0.5;
        float diffuse = max(dot(normal, lightDir), 0.0);
        
        // Add specular reflection
        vec3 viewDir = -rd;
        vec3 halfDir = normalize(lightDir + viewDir);
        float specular = pow(max(dot(normal, halfDir), 0.0), 32.0) * specularIntensity;
        float lighting = ambient + diffuse * 0.3;
        
        // Combine all lighting effects
        color = texColor * mix(lighting, 2.0, lightIntensity);
        color += specular * vec3(0.3, 0.4, 0.5) * 1.5; // Add blue-tinted specular highlights

        // Add atmospheric glow
        float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 4.0);
        vec3 atmosphereColor = vec3(0.1, 0.2, 0.4);
        color += fresnel * atmosphereColor * 0.3;
    } else {
      // Add starry background
      vec2 uv = fragCoord.xy/iResolution.xy * 2.0 - 1.0;
      color = stars(uv, 0.0) * vec3(0.8, 0.9, 1.0);
      
      // Add meteors with time scaling
      color += meteorEffect(uv, iTime * 0.5);
    }

    fragColor = vec4(color, 1.0);
}`;
const shader = new Shader();
shader.addMainPass(main);
shader.addTexture("/earth/8k_earth_nightmap.jpg");
shader.addTexture("/earth/8k_earth_normal_map.jpg");
shader.addTexture("/earth/8k_earth_specular_map.jpg");

export default shader;
