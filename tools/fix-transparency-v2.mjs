/**
 * Fix fake transparency in DALL-E generated images - V2
 * Uses smarter background detection based on corner sampling
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = 'C:/Users/shiel/OneDrive/Documents/Trolley/assets';

// Files that need transparency fixing
const filesToFix = [
  'icons/icon_currency.png',
  'icons/icon_health.png',
  'icons/icon_locked.png',
  'icons/icon_star.png',
  'buttons/button_shop.png',
  'buttons/button_profile.png',
  'buttons/button_back.png',
  'buttons/button_buy.png',
  'buttons/button_equip.png',
  'buttons/button_worldMap.png',
  'buttons/button_login.png',
  'buttons/button_createAccount.png',
  'frames/frame_zoneCard.png',
  'frames/frame_itemCard.png'
];

// Color distance function
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

async function removeBackgroundAndCrop(inputPath) {
  console.log(`Processing: ${path.basename(inputPath)}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels;

    // Sample corners to detect background color
    const cornerSamples = [];
    const samplePoints = [
      [5, 5], [width - 6, 5], [5, height - 6], [width - 6, height - 6],
      [10, 10], [width - 11, 10], [10, height - 11], [width - 11, height - 11],
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
    ];

    for (const [x, y] of samplePoints) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * channels;
        cornerSamples.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2]
        });
      }
    }

    // Find most common corner color (likely background)
    const bgColors = [];

    // Add common checkerboard colors
    bgColors.push({ r: 204, g: 204, b: 204, tolerance: 25 }); // Light checker
    bgColors.push({ r: 153, g: 153, b: 153, tolerance: 25 }); // Dark checker
    bgColors.push({ r: 255, g: 255, b: 255, tolerance: 15 }); // White
    bgColors.push({ r: 238, g: 238, b: 238, tolerance: 15 }); // Near white

    // Add sampled corner colors with tighter tolerance
    for (const sample of cornerSamples) {
      // Check if it's grayish (likely background)
      const isGrayish = Math.abs(sample.r - sample.g) < 30 &&
                        Math.abs(sample.g - sample.b) < 30 &&
                        Math.abs(sample.r - sample.b) < 30;
      if (isGrayish) {
        bgColors.push({ ...sample, tolerance: 35 });
      }
    }

    // Create output buffer with alpha
    const outputData = Buffer.alloc(width * height * 4);

    // Process each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * channels;
        const dstIdx = (y * width + x) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        // Check if this pixel matches any background color
        let isBackground = false;
        for (const bg of bgColors) {
          if (colorDistance(r, g, b, bg.r, bg.g, bg.b) < bg.tolerance) {
            isBackground = true;
            break;
          }
        }

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

    // Create image and trim
    const trimmed = await sharp(outputData, {
      raw: { width, height, channels: 4 }
    })
      .trim()
      .png()
      .toBuffer();

    fs.writeFileSync(inputPath, trimmed);

    const newMeta = await sharp(trimmed).metadata();
    console.log(`  ✓ ${width}x${height} -> ${newMeta.width}x${newMeta.height}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Fixing Transparency v2 ===\n');

  // First, restore originals from backup if they exist, or re-download
  // For now, we'll just process the current files

  let success = 0, failed = 0;

  for (const relPath of filesToFix) {
    const fullPath = path.join(ASSETS_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      if (await removeBackgroundAndCrop(fullPath)) success++;
      else failed++;
    }
  }

  console.log(`\nSuccess: ${success}, Failed: ${failed}`);
}

main();
