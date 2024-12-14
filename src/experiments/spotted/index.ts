// 在你的实验文件中
export const bufferA = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 第一个通道的计算
    // 可以访问 iChannel0 (noise texture)
}`;

export const bufferB = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 第二个通道的计算
    // 可以访问 iChannel0 (noise texture) 和 iChannel1 (bufferA的结果)
}`;

export const main = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 最终输出
    // 可以访问 iChannel0 (noise texture), iChannel1 (bufferA), iChannel2 (bufferB)

    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

export const shaders = [main];
export const textures = ["/textures/noise.png"];
