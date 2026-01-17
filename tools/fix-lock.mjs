import sharp from 'sharp';
import fs from 'fs-extra';

const inputPath = 'C:/Users/shiel/OneDrive/Documents/Trolley/assets/icons/icon_locked.png';

async function fixLock() {
  console.log('Fixing lock icon background...');

  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;

  const outputData = Buffer.alloc(width * height * 4);

  // More aggressive background removal for this specific image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Detect grayish/beige backgrounds and textured noise
      const isGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
      const isLight = r > 180 && g > 170 && b > 150;
      const isDark = r < 80 && g < 80 && b < 80;
      const isSpeckle = (r < 60 && g < 60 && b < 60) || (r > 200 && g > 190 && b > 170);

      // Remove if it's background-like
      const isBackground = (isGray && (isLight || isDark)) || isSpeckle;

      if (isBackground) {
        outputData[dstIdx] = 0;
        outputData[dstIdx + 1] = 0;
        outputData[dstIdx + 2] = 0;
        outputData[dstIdx + 3] = 0;
      } else {
        outputData[dstIdx] = r;
        outputData[dstIdx + 1] = g;
        outputData[dstIdx + 2] = b;
        outputData[dstIdx + 3] = 255;
      }
    }
  }

  const result = await sharp(outputData, { raw: { width, height, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  await fs.writeFile(inputPath, result);
  const newMeta = await sharp(result).metadata();
  console.log(`Done: ${newMeta.width}x${newMeta.height}`);
}

fixLock();
