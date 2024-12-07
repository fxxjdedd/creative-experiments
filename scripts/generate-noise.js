const { createCanvas } = require("canvas");
const fs = require("fs");

// Create a canvas
const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext("2d");

// Generate Perlin-like noise
function generateNoise() {
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const i = (y * size + x) * 4;
      const value = Math.random() * 255;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255; // A
    }
  }

  return imageData;
}

// Draw noise
ctx.putImageData(generateNoise(), 0, 0);

// Save to file
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync("public/textures/noise.png", buffer);
