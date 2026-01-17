/**
 * Remove Background - Improved transparency tool for game assets
 *
 * Uses flood-fill from corners to detect and remove solid backgrounds,
 * avoiding the issues with global color matching that can accidentally
 * remove parts of the actual image content.
 *
 * Usage:
 *   node remove-background.mjs [file.png]           - Process single file
 *   node remove-background.mjs --all                - Process all assets in manifest
 *   node remove-background.mjs --category=buttons   - Process category
 *   node remove-background.mjs --check [file.png]   - Check without modifying
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'documentation', 'assets-manifest.json');

// Configuration
const CONFIG = {
  // Tolerance for color matching (0-255)
  whiteTolerance: 45,    // Higher tolerance for white (can have slight variations)
  blackTolerance: 15,    // Lower tolerance for black (more precise)

  // Edge smoothing
  edgeSmooth: true,
  edgeSmoothRadius: 1,

  // Minimum margin to keep around content after trim
  trimMargin: 2,

  // Debug mode - saves intermediate files
  debug: false
};

/**
 * Load the asset manifest
 */
function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Error: assets-manifest.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

/**
 * Detect background color from corners
 * Returns { color: [r,g,b], type: 'white'|'black'|'unknown' }
 */
async function detectBackgroundColor(imagePath) {
  const image = sharp(imagePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Sample corners (with small offset to avoid edge artifacts)
  const offset = 5;
  const corners = [
    { x: offset, y: offset },                           // top-left
    { x: width - offset - 1, y: offset },               // top-right
    { x: offset, y: height - offset - 1 },              // bottom-left
    { x: width - offset - 1, y: height - offset - 1 }   // bottom-right
  ];

  const samples = corners.map(({ x, y }) => {
    const idx = (y * width + x) * channels;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2]
    };
  });

  // Check if all corners are similar (background)
  const avgR = samples.reduce((sum, s) => sum + s.r, 0) / samples.length;
  const avgG = samples.reduce((sum, s) => sum + s.g, 0) / samples.length;
  const avgB = samples.reduce((sum, s) => sum + s.b, 0) / samples.length;

  // Check variance - if too high, corners are different colors
  const variance = samples.reduce((sum, s) => {
    return sum + Math.abs(s.r - avgR) + Math.abs(s.g - avgG) + Math.abs(s.b - avgB);
  }, 0) / samples.length;

  if (variance > 30) {
    return { color: [avgR, avgG, avgB], type: 'unknown', variance };
  }

  // Determine if white or black background
  const brightness = (avgR + avgG + avgB) / 3;

  if (brightness > 230) {
    return { color: [avgR, avgG, avgB], type: 'white', variance };
  } else if (brightness < 25) {
    return { color: [avgR, avgG, avgB], type: 'black', variance };
  } else {
    return { color: [avgR, avgG, avgB], type: 'unknown', variance };
  }
}

/**
 * Flood-fill to find all background pixels starting from corners
 */
function floodFillBackground(data, width, height, channels, bgColor, tolerance) {
  const [bgR, bgG, bgB] = bgColor;
  const visited = new Set();
  const backgroundPixels = new Set();

  // Check if pixel matches background color within tolerance
  const isBackground = (idx) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return Math.abs(r - bgR) <= tolerance &&
           Math.abs(g - bgG) <= tolerance &&
           Math.abs(b - bgB) <= tolerance;
  };

  // Convert x,y to index
  const toIdx = (x, y) => (y * width + x) * channels;
  const toKey = (x, y) => `${x},${y}`;

  // BFS flood fill from a starting point
  const fill = (startX, startY) => {
    const queue = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = toKey(x, y);

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      visited.add(key);

      const idx = toIdx(x, y);
      if (!isBackground(idx)) continue;

      backgroundPixels.add(key);

      // Add neighbors (4-connected)
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  };

  // Start flood fill from all four corners
  fill(0, 0);
  fill(width - 1, 0);
  fill(0, height - 1);
  fill(width - 1, height - 1);

  // Also fill from edges (in case corners have content)
  for (let x = 0; x < width; x += 10) {
    fill(x, 0);
    fill(x, height - 1);
  }
  for (let y = 0; y < height; y += 10) {
    fill(0, y);
    fill(width - 1, y);
  }

  return backgroundPixels;
}

/**
 * Apply simple edge smoothing by looking at neighboring alpha values
 */
function smoothEdges(outputData, width, height) {
  const tempAlpha = new Uint8Array(width * height);

  // Copy current alpha values
  for (let i = 0; i < width * height; i++) {
    tempAlpha[i] = outputData[i * 4 + 3];
  }

  // Apply smoothing - average alpha with neighbors for edge pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const alpha = tempAlpha[idx];

      // Only process edge pixels (partially transparent neighbors)
      if (alpha === 255) {
        const neighbors = [
          tempAlpha[idx - 1],
          tempAlpha[idx + 1],
          tempAlpha[idx - width],
          tempAlpha[idx + width]
        ];

        const hasTransparentNeighbor = neighbors.some(a => a === 0);

        if (hasTransparentNeighbor) {
          // This is an edge pixel - apply slight anti-aliasing
          const avgNeighborAlpha = neighbors.reduce((a, b) => a + b, 0) / 4;
          const newAlpha = Math.round((alpha + avgNeighborAlpha) / 2);
          outputData[idx * 4 + 3] = Math.max(newAlpha, 200); // Don't make too transparent
        }
      }
    }
  }
}

/**
 * Remove background from an image file
 */
async function removeBackground(inputPath, options = {}) {
  const basename = path.basename(inputPath);
  console.log(`Processing: ${basename}`);

  // Check if file exists
  if (!fs.existsSync(inputPath)) {
    console.log(`  ✗ File not found: ${inputPath}`);
    return { success: false, error: 'File not found' };
  }

  try {
    // Detect background color
    const bgInfo = await detectBackgroundColor(inputPath);
    console.log(`  Background: ${bgInfo.type} (variance: ${bgInfo.variance.toFixed(1)})`);

    if (bgInfo.type === 'unknown') {
      console.log(`  ⚠ Could not reliably detect background color`);
      if (!options.force) {
        console.log(`  Skipping (use --force to process anyway)`);
        return { success: false, error: 'Unknown background' };
      }
    }

    // Determine tolerance based on background type
    const tolerance = bgInfo.type === 'white' ? CONFIG.whiteTolerance : CONFIG.blackTolerance;

    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;

    // Find background pixels using flood fill
    console.log(`  Finding background pixels...`);
    const backgroundPixels = floodFillBackground(
      data, width, height, channels,
      bgInfo.color, tolerance
    );
    console.log(`  Found ${backgroundPixels.size} background pixels (${((backgroundPixels.size / (width * height)) * 100).toFixed(1)}%)`);

    // Create output buffer with alpha channel
    const outputData = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * channels;
        const dstIdx = (y * width + x) * 4;
        const key = `${x},${y}`;

        if (backgroundPixels.has(key)) {
          // Transparent
          outputData[dstIdx] = 0;
          outputData[dstIdx + 1] = 0;
          outputData[dstIdx + 2] = 0;
          outputData[dstIdx + 3] = 0;
        } else {
          // Keep original color, fully opaque
          outputData[dstIdx] = data[srcIdx];
          outputData[dstIdx + 1] = data[srcIdx + 1];
          outputData[dstIdx + 2] = data[srcIdx + 2];
          outputData[dstIdx + 3] = 255;
        }
      }
    }

    // Apply edge smoothing
    if (CONFIG.edgeSmooth) {
      console.log(`  Smoothing edges...`);
      smoothEdges(outputData, width, height);
    }

    // Create new image with alpha
    let outputImage = sharp(outputData, {
      raw: { width, height, channels: 4 }
    });

    // Trim transparent pixels
    const trimmed = await outputImage.trim().png().toBuffer();

    // Get new dimensions
    const newMeta = await sharp(trimmed).metadata();

    if (options.checkOnly) {
      console.log(`  ✓ Would trim: ${width}x${height} -> ${newMeta.width}x${newMeta.height}`);
      return { success: true, wouldModify: true };
    }

    // Save
    fs.writeFileSync(inputPath, trimmed);
    console.log(`  ✓ Saved: ${width}x${height} -> ${newMeta.width}x${newMeta.height}`);

    return {
      success: true,
      originalSize: { width, height },
      newSize: { width: newMeta.width, height: newMeta.height },
      backgroundPixelsRemoved: backgroundPixels.size
    };

  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get all assets from manifest that need transparency
 */
function getAssetsFromManifest(category = null) {
  const manifest = loadManifest();
  const assets = [];

  const categories = category
    ? [category]
    : ['buttons', 'icons', 'frames', 'trolleySkins'];

  for (const cat of categories) {
    const items = manifest.requiredAssets[cat] || [];
    for (const item of items) {
      let assetDir = ASSETS_DIR;
      if (cat === 'buttons') assetDir = path.join(ASSETS_DIR, 'buttons');
      else if (cat === 'icons') assetDir = path.join(ASSETS_DIR, 'icons');
      else if (cat === 'frames') assetDir = path.join(ASSETS_DIR, 'frames');
      else if (cat === 'trolleySkins') assetDir = path.join(ASSETS_DIR, 'trolley_skins');

      assets.push({
        ...item,
        path: path.join(assetDir, item.file),
        category: cat
      });
    }
  }

  return assets;
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);

  console.log('=== Remove Background Tool ===\n');

  // Parse options
  const options = {
    checkOnly: args.includes('--check'),
    force: args.includes('--force'),
    all: args.includes('--all')
  };

  const categoryArg = args.find(a => a.startsWith('--category='));
  const category = categoryArg ? categoryArg.split('=')[1] : null;

  // Get files to process
  let filesToProcess = [];

  if (options.all || category) {
    // Process from manifest
    const assets = getAssetsFromManifest(category);
    filesToProcess = assets
      .filter(a => fs.existsSync(a.path))
      .map(a => a.path);

    console.log(`Found ${filesToProcess.length} files from manifest\n`);
  } else {
    // Process specific file(s)
    const files = args.filter(a => !a.startsWith('--') && a.endsWith('.png'));

    if (files.length === 0) {
      console.log('Usage:');
      console.log('  node remove-background.mjs <file.png>');
      console.log('  node remove-background.mjs --all');
      console.log('  node remove-background.mjs --category=buttons');
      console.log('');
      console.log('Options:');
      console.log('  --check    Check files without modifying');
      console.log('  --force    Process even if background is unknown');
      console.log('  --all      Process all assets in manifest');
      console.log('  --category Process specific category (buttons, icons, frames, trolleySkins)');
      return;
    }

    filesToProcess = files.map(f => {
      // If relative path, resolve from current dir
      return path.isAbsolute(f) ? f : path.resolve(process.cwd(), f);
    });
  }

  // Process files
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const filePath of filesToProcess) {
    const result = await removeBackground(filePath, options);

    if (result.success) {
      success++;
    } else if (result.error === 'Unknown background') {
      skipped++;
    } else {
      failed++;
    }

    console.log('');
  }

  // Summary
  console.log('=== Summary ===');
  console.log(`Success: ${success}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
