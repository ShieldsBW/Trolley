/**
 * Fix fake transparency in DALL-E generated images
 * - Removes checkerboard background pattern
 * - Makes background truly transparent
 * - Crops to content bounds
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = 'C:/Users/shiel/OneDrive/Documents/Trolley/assets';

// Files that need transparency fixing (newly generated)
const filesToFix = [
  // Icons
  'icons/icon_currency.png',
  'icons/icon_health.png',
  'icons/icon_locked.png',
  'icons/icon_star.png',
  // Buttons
  'buttons/button_shop.png',
  'buttons/button_profile.png',
  'buttons/button_back.png',
  'buttons/button_buy.png',
  'buttons/button_equip.png',
  'buttons/button_worldMap.png',
  'buttons/button_login.png',
  'buttons/button_createAccount.png',
  // Frames
  'frames/frame_zoneCard.png',
  'frames/frame_itemCard.png'
];

async function removeBackgroundAndCrop(inputPath) {
  console.log(`Processing: ${path.basename(inputPath)}`);

  try {
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Get raw pixel data
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create output buffer with alpha channel
    const outputData = Buffer.alloc(width * height * 4);

    // Checkerboard colors (light and dark gray)
    const isCheckerboardColor = (r, g, b) => {
      // Light checker: ~204, 204, 204
      // Dark checker: ~153, 153, 153
      const isLightChecker = Math.abs(r - 204) < 20 && Math.abs(g - 204) < 20 && Math.abs(b - 204) < 20;
      const isDarkChecker = Math.abs(r - 153) < 20 && Math.abs(g - 153) < 20 && Math.abs(b - 153) < 20;
      // Also check for near-white backgrounds
      const isNearWhite = r > 240 && g > 240 && b > 240;
      // And dark backgrounds
      const isDark = r < 50 && g < 50 && b < 50;
      return isLightChecker || isDarkChecker || isNearWhite;
    };

    // Process each pixel
    const channels = info.channels;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * channels;
        const dstIdx = (y * width + x) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        if (isCheckerboardColor(r, g, b)) {
          // Make transparent
          outputData[dstIdx] = 0;
          outputData[dstIdx + 1] = 0;
          outputData[dstIdx + 2] = 0;
          outputData[dstIdx + 3] = 0;
        } else {
          // Keep original color, fully opaque
          outputData[dstIdx] = r;
          outputData[dstIdx + 1] = g;
          outputData[dstIdx + 2] = b;
          outputData[dstIdx + 3] = 255;
        }
      }
    }

    // Create new image with alpha
    const outputImage = sharp(outputData, {
      raw: {
        width,
        height,
        channels: 4
      }
    });

    // Trim transparent pixels (crop to content)
    const trimmed = await outputImage
      .trim()
      .png()
      .toBuffer();

    // Save back to same path
    fs.writeFileSync(inputPath, trimmed);

    // Get new dimensions
    const newMeta = await sharp(trimmed).metadata();
    console.log(`  ✓ ${width}x${height} -> ${newMeta.width}x${newMeta.height} (trimmed)`);

    return true;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Fixing Transparency ===\n');

  let success = 0;
  let failed = 0;

  for (const relPath of filesToFix) {
    const fullPath = path.join(ASSETS_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const result = await removeBackgroundAndCrop(fullPath);
      if (result) success++;
      else failed++;
    } else {
      console.log(`Skipping (not found): ${relPath}`);
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main();
