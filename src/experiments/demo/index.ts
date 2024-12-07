import { ShaderToyRunner } from "../../shadertoy-runner";

export default /*glsl*/ `
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    // Create a simple gradient using the UV coordinates
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    
    // Output to screen
    fragColor = vec4(col,1.0);
}

`;
