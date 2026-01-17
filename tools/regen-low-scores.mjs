/**
 * Regenerate assets that scored below 8/10
 * With improved prompts for better style matching
 */

import OpenAI from 'openai';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

const DOCS_DIR = 'C:/Users/shiel/OneDrive/Documents/Trolley/documentation';
const ASSETS_DIR = 'C:/Users/shiel/OneDrive/Documents/Trolley/assets';

// Cost tracking
let sessionCost = 0;
const COST_PER_IMAGE = 0.08;

// Load API key
async function getApiKey() {
  const keysPath = path.join(DOCS_DIR, 'keys.txt');
  const content = await fs.readFile(keysPath, 'utf-8');
  const match = content.match(/sk-[a-zA-Z0-9_-]+/);
  return match ? match[0] : null;
}

// Assets to regenerate with IMPROVED prompts
const assetsToRegenerate = [
  {
    id: 'level_02_background',
    file: 'backgrounds/level_02_background.png',
    prompt: `Railway tracks forking through a Victorian industrial district, brick factories with tall chimneys releasing white steam, iron bridges and gantries overhead, late afternoon golden hour lighting breaking through steam clouds, puddles on cobblestones reflecting warm orange sky, hand-painted digital illustration in Studio Ghibli style, soft painterly brushwork with visible strokes, warm earth tones with brass and copper accents, muted browns greens and amber colors, nostalgic 1920s-1940s railway atmosphere, game background art, 16:9 aspect ratio, no text no watermarks`
  },
  {
    id: 'level_03_background',
    file: 'backgrounds/level_03_background.png',
    prompt: `Railway tracks branching through a 1920s vintage city district, old brick and stone art deco buildings with warm facades, vintage streetcars and period automobiles, trolley wires overhead, dramatic perspective down cobblestone streets, golden sunset lighting casting long warm shadows, hand-painted digital illustration in Studio Ghibli style, soft painterly brushwork, warm earth tones brass browns and cream colors, nostalgic vintage railway atmosphere NOT modern, game background art, 16:9 aspect ratio, no text no watermarks`
  },
  {
    id: 'icon_currency',
    file: 'icons/icon_currency.png',
    prompt: `A single vintage brass coin with an embossed trolley train design, hand-painted 2D illustration style, flat shading with soft edges, warm golden brass color with subtle patina, Studio Ghibli inspired painterly look, solid opaque colors NO transparency effects NO reflections NO 3D rendering, simple clean icon design, isolated on solid light gray background #CCCCCC, game UI icon, square format`
  },
  {
    id: 'icon_health',
    file: 'icons/icon_health.png',
    prompt: `A vintage heart icon with brass metal frame border, hand-painted 2D illustration style, flat shading with soft edges, deep red heart with warm golden brass outline, Studio Ghibli inspired painterly look, solid opaque colors NO transparency effects NO glass NO 3D rendering, Victorian railway aesthetic, simple clean icon design, isolated on solid light gray background #CCCCCC, game UI icon, square format`
  },
  {
    id: 'icon_locked',
    file: 'icons/icon_locked.png',
    prompt: `A vintage brass padlock icon with ornate Victorian keyhole design, hand-painted 2D illustration style, flat shading with soft painterly edges, warm brass and bronze colors with aged patina, Studio Ghibli inspired illustrated look, solid opaque colors NO transparency NO 3D rendering NO metallic reflections, antique railway aesthetic, simple clean silhouette, isolated on solid light gray background #CCCCCC, game UI icon, square format`
  },
  {
    id: 'icon_star',
    file: 'icons/icon_star.png',
    prompt: `A five-pointed star icon in vintage brass gold color, hand-painted 2D illustration style, flat shading with soft painterly edges, warm golden color with subtle aged texture, Studio Ghibli inspired illustrated look, solid opaque fill NO transparency NO 3D NO metallic shine, Victorian railway award badge aesthetic, simple clean shape, isolated on solid light gray background #CCCCCC, game UI icon, square format`
  }
];

// Color distance for background removal
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

// Remove gray background and make transparent
async function removeBackground(inputPath, isIcon) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;

  const outputData = Buffer.alloc(width * height * 4);

  // Target background color (light gray #CCCCCC = 204,204,204)
  const bgColors = [
    { r: 204, g: 204, b: 204, tolerance: 30 },
    { r: 153, g: 153, b: 153, tolerance: 25 },
    { r: 238, g: 238, b: 238, tolerance: 20 },
    { r: 255, g: 255, b: 255, tolerance: 15 }
  ];

  // For icons, also sample corners to detect actual background
  if (isIcon) {
    const cornerPoints = [[5, 5], [width - 6, 5], [5, height - 6], [width - 6, height - 6]];
    for (const [x, y] of cornerPoints) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      // Add if grayish
      if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
        bgColors.push({ r, g, b, tolerance: 25 });
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

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

  const result = await sharp(outputData, {
    raw: { width, height, channels: 4 }
  })
    .trim()
    .png()
    .toBuffer();

  await fs.writeFile(inputPath, result);
  const newMeta = await sharp(result).metadata();
  return { width: newMeta.width, height: newMeta.height };
}

async function main() {
  console.log('=== Regenerating Low-Scoring Assets ===\n');

  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('API key not found');
    return;
  }

  const openai = new OpenAI({ apiKey });

  for (const asset of assetsToRegenerate) {
    console.log(`\nGenerating: ${asset.id}`);

    try {
      const isIcon = asset.id.startsWith('icon_');
      const size = isIcon ? '1024x1024' : '1792x1024';

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: asset.prompt,
        n: 1,
        size: size,
        quality: 'hd',
        style: 'vivid'
      });

      sessionCost += COST_PER_IMAGE;

      const imageUrl = response.data[0].url;
      const imageResponse = await fetch(imageUrl);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());

      const outputPath = path.join(ASSETS_DIR, asset.file);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, buffer);

      console.log(`  Downloaded: ${asset.file}`);

      // For icons, remove background and crop
      if (isIcon) {
        const dims = await removeBackground(outputPath, true);
        console.log(`  Processed: ${dims.width}x${dims.height} (transparent, cropped)`);
      }

      console.log(`  ✓ Complete ($${sessionCost.toFixed(2)} spent)`);

      // Delay between requests
      await new Promise(r => setTimeout(r, 2000));

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Total cost: $${sessionCost.toFixed(2)}`);
}

main();
