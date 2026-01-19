#!/usr/bin/env node

/**
 * Trolley Problem - Asset Generation Pipeline
 *
 * An automated system for generating, reviewing, and iterating on game assets
 * using DALL-E 3 for generation and GPT-4V for style consistency review.
 *
 * Usage:
 *   node asset-pipeline.js generate [--category=backgrounds|buttons|icons] [--id=asset_id]
 *   node asset-pipeline.js screenshot [--scene=all|login|menu|...]
 *   node asset-pipeline.js review [--all] [--id=asset_id]
 *   node asset-pipeline.js pipeline [--category=backgrounds] [--max-iterations=3]
 *   node asset-pipeline.js status
 */

import { program } from 'commander';
import OpenAI from 'openai';
import puppeteer from 'puppeteer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');
const DOCS_DIR = path.join(PROJECT_ROOT, 'documentation');
const SCREENSHOTS_DIR = path.join(PROJECT_ROOT, 'screenshots');

// ============================================================================
// COST TRACKING
// ============================================================================

const COSTS = {
  'dall-e-3-hd': 0.08,      // per image (1792x1024)
  'dall-e-3-standard': 0.04, // per image
  'gpt-4o-vision': 0.02      // approximate per review
};

let sessionCost = 0;
let costLimit = 5.00; // Default $5 limit

function trackCost(type) {
  const cost = COSTS[type] || 0;
  sessionCost += cost;
  return cost;
}

function checkBudget(estimatedCost = 0) {
  if (sessionCost + estimatedCost > costLimit) {
    console.log(chalk.red(`\n⚠️  BUDGET LIMIT REACHED: $${sessionCost.toFixed(2)} / $${costLimit.toFixed(2)}`));
    console.log(chalk.yellow('Stopping to prevent overspend. Use --budget to increase limit.\n'));
    return false;
  }
  return true;
}

function printCostSummary() {
  console.log(chalk.cyan(`\n💰 Session Cost: $${sessionCost.toFixed(2)} / $${costLimit.toFixed(2)} budget`));
}

// ============================================================================
// CONFIGURATION
// ============================================================================

async function loadConfig() {
  // Try to load API key from keys.txt
  const keysPath = path.join(DOCS_DIR, 'keys.txt');
  let apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey && await fs.pathExists(keysPath)) {
    const keysContent = await fs.readFile(keysPath, 'utf-8');
    const match = keysContent.match(/sk-[a-zA-Z0-9_-]+/);
    if (match) {
      apiKey = match[0];
    }
  }

  if (!apiKey) {
    console.error(chalk.red('Error: OpenAI API key not found.'));
    console.error('Please add your key to documentation/keys.txt or set OPENAI_API_KEY env var.');
    process.exit(1);
  }

  return { apiKey };
}

async function loadManifest() {
  const manifestPath = path.join(DOCS_DIR, 'assets-manifest.json');
  if (!await fs.pathExists(manifestPath)) {
    console.error(chalk.red('Error: assets-manifest.json not found in documentation/'));
    process.exit(1);
  }
  return await fs.readJson(manifestPath);
}

async function loadStyleGuide() {
  const stylePath = path.join(DOCS_DIR, 'STYLE_GUIDE.md');
  if (!await fs.pathExists(stylePath)) {
    console.error(chalk.red('Error: STYLE_GUIDE.md not found in documentation/'));
    process.exit(1);
  }
  return await fs.readFile(stylePath, 'utf-8');
}

// ============================================================================
// OPENAI CLIENT
// ============================================================================

let openai = null;

async function getOpenAI() {
  if (!openai) {
    const config = await loadConfig();
    openai = new OpenAI({ apiKey: config.apiKey });
  }
  return openai;
}

// ============================================================================
// REMBG BACKGROUND REMOVAL
// ============================================================================

import { execSync } from 'child_process';

/**
 * Remove background from an image using rembg (AI-powered)
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function removeBackgroundWithRembg(imagePath) {
  const spinner = ora(`Removing background: ${path.basename(imagePath)}...`).start();

  try {
    const rembgScript = path.join(__dirname, 'rembg-remove.py');

    // Check if rembg script exists
    if (!await fs.pathExists(rembgScript)) {
      spinner.warn(chalk.yellow(`rembg-remove.py not found, skipping background removal`));
      return { success: false, error: 'rembg script not found' };
    }

    // Run rembg with --trim flag
    execSync(`python "${rembgScript}" "${imagePath}" --trim`, {
      stdio: 'pipe',
      timeout: 120000 // 2 minute timeout
    });

    spinner.succeed(chalk.green(`Background removed: ${path.basename(imagePath)}`));
    return { success: true };

  } catch (error) {
    spinner.fail(chalk.red(`Background removal failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Check if an asset type needs background removal
 */
function needsBackgroundRemoval(assetId) {
  // Backgrounds don't need removal, everything else does
  return !assetId.includes('bg') && !assetId.includes('background');
}

// ============================================================================
// GENERATE COMMAND - DALL-E 3 Image Generation
// ============================================================================

async function generateAsset(asset, options = {}) {
  const client = await getOpenAI();
  const versionSuffix = options.version ? `_v${options.version}` : '';
  const spinnerText = options.version
    ? `Generating ${asset.id} (version ${options.version})...`
    : `Generating ${asset.id}...`;
  const spinner = ora(spinnerText).start();

  try {
    // Determine size based on asset type
    let size = '1792x1024'; // Default for backgrounds
    if (asset.size) {
      // Map common sizes to DALL-E supported sizes
      if (asset.size.includes('64') || asset.size.includes('128') || asset.size.includes('256')) {
        size = '1024x1024'; // Icons - will be resized later
      } else if (asset.size.includes('300x400') || asset.size.includes('200x250')) {
        size = '1024x1024'; // Frames/cards
      }
    }

    // Check budget before generating
    const quality = options.quality || 'hd';
    if (!checkBudget(COSTS[`dall-e-3-${quality}`])) {
      return { success: false, error: 'Budget limit reached' };
    }

    // Build full prompt with negative prompt if provided
    let fullPrompt = asset.prompt;
    if (asset.negativePrompt) {
      // Append negative prompt with separator
      fullPrompt = `${asset.prompt} | Avoid: ${asset.negativePrompt}`;
    }

    // For textless variants, modify the prompt
    if (options.textless && asset.text) {
      fullPrompt = fullPrompt.replace(/reading [A-Z\s]+,/i, 'with empty text area,');
      fullPrompt = fullPrompt.replace(/with text "[^"]+"/i, 'with empty text area');
      fullPrompt = fullPrompt.replace(/displaying the words [A-Z\s]+/i, 'with empty text area');
      fullPrompt += ', no text, blank label area';
    }

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: size,
      quality: quality,
      style: options.style || 'vivid'
    });

    // Track the cost
    trackCost(`dall-e-3-${quality}`);

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine output path
    let outputDir = ASSETS_DIR;
    if (asset.id.includes('bg') || asset.id.includes('background')) {
      outputDir = path.join(ASSETS_DIR, 'backgrounds');
    } else if (asset.id.includes('button')) {
      outputDir = path.join(ASSETS_DIR, 'buttons');
    } else if (asset.id.includes('icon')) {
      outputDir = path.join(ASSETS_DIR, 'icons');
      await fs.ensureDir(outputDir);
    } else if (asset.id.includes('text')) {
      outputDir = path.join(ASSETS_DIR, 'text');
    } else if (asset.id.includes('frame')) {
      outputDir = path.join(ASSETS_DIR, 'frames');
      await fs.ensureDir(outputDir);
    } else if (asset.id.includes('trolley_preview')) {
      outputDir = path.join(ASSETS_DIR, 'trolley_skins');
      await fs.ensureDir(outputDir);
    }

    await fs.ensureDir(outputDir);

    // Add version suffix to filename if generating multiple versions
    let outputFile = asset.file;
    if (versionSuffix) {
      const ext = path.extname(asset.file);
      const base = path.basename(asset.file, ext);
      outputFile = `${base}${versionSuffix}${ext}`;
    }

    const outputPath = path.join(outputDir, outputFile);
    await fs.writeFile(outputPath, buffer);

    spinner.succeed(chalk.green(`Generated ${asset.id}${versionSuffix} -> ${path.relative(PROJECT_ROOT, outputPath)}`));

    // Automatically remove background for non-background assets (unless --no-rembg)
    // Commander sets options.rembg = false when --no-rembg is used (default is undefined/true)
    if (options.rembg !== false && needsBackgroundRemoval(asset.id)) {
      await removeBackgroundWithRembg(outputPath);
    }

    return {
      success: true,
      path: outputPath,
      revisedPrompt,
      version: options.version
    };

  } catch (error) {
    spinner.fail(chalk.red(`Failed to generate ${asset.id}: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate multiple versions of a text asset for user selection
 */
async function generateMultipleVersions(asset, count = 3, options = {}) {
  console.log(chalk.cyan(`\nGenerating ${count} versions of ${asset.id} for selection...\n`));

  const results = [];

  for (let i = 1; i <= count; i++) {
    const result = await generateAsset(asset, { ...options, version: i });
    results.push(result);

    // Add delay between requests
    if (i < count) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(chalk.cyan(`\nGenerated ${successCount}/${count} versions successfully.`));

  if (successCount > 0) {
    console.log(chalk.yellow('\nReview the generated versions:'));
    results.forEach((r, i) => {
      if (r.success) {
        console.log(chalk.white(`  ${i + 1}. ${r.path}`));
      }
    });
    console.log(chalk.yellow('\nSelect the best version, or regenerate if none are acceptable.'));
  }

  return results;
}

async function generateCommand(options) {
  const manifest = await loadManifest();
  const category = options.category;
  const assetId = options.id;
  const priority = options.priority;
  const versions = parseInt(options.versions) || 1;
  const textless = options.textless || false;

  console.log(chalk.cyan('\n=== ASSET GENERATION ===\n'));

  // Collect assets to generate
  let assetsToGenerate = [];

  if (assetId) {
    // Find specific asset
    for (const cat of Object.keys(manifest.requiredAssets)) {
      const asset = manifest.requiredAssets[cat].find(a => a.id === assetId);
      if (asset) {
        assetsToGenerate.push(asset);
        break;
      }
    }
    if (assetsToGenerate.length === 0) {
      console.error(chalk.red(`Asset '${assetId}' not found in manifest.`));
      return;
    }
  } else if (category) {
    // Get all assets in category
    assetsToGenerate = manifest.requiredAssets[category] || [];
    if (assetsToGenerate.length === 0) {
      console.error(chalk.red(`Category '${category}' not found or empty.`));
      return;
    }
  } else {
    // Get all required assets
    for (const cat of Object.keys(manifest.requiredAssets)) {
      assetsToGenerate.push(...manifest.requiredAssets[cat]);
    }
  }

  // Filter by priority if specified
  if (priority) {
    assetsToGenerate = assetsToGenerate.filter(a => a.priority === priority);
  }

  console.log(chalk.white(`Found ${assetsToGenerate.length} assets to generate.\n`));

  // Generate each asset
  const results = { success: [], failed: [] };

  for (const asset of assetsToGenerate) {
    // Generate multiple versions if requested
    if (versions > 1) {
      const multiResults = await generateMultipleVersions(asset, versions, { ...options, textless });
      const successes = multiResults.filter(r => r.success);
      if (successes.length > 0) {
        results.success.push({ asset, results: multiResults });
      } else {
        results.failed.push({ asset, results: multiResults });
      }
    } else {
      const result = await generateAsset(asset, { ...options, textless });
      if (result.success) {
        results.success.push({ asset, result });
      } else {
        results.failed.push({ asset, result });
      }
    }

    // Add delay between requests to avoid rate limiting
    if (assetsToGenerate.indexOf(asset) < assetsToGenerate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log(chalk.cyan('\n=== GENERATION SUMMARY ===\n'));
  console.log(chalk.green(`Success: ${results.success.length}`));
  console.log(chalk.red(`Failed: ${results.failed.length}`));

  if (results.failed.length > 0) {
    console.log(chalk.yellow('\nFailed assets:'));
    results.failed.forEach(({ asset, result }) => {
      console.log(chalk.red(`  - ${asset.id}: ${result?.error || 'All versions failed'}`));
    });
  }

  printCostSummary();
}

// ============================================================================
// SCREENSHOT COMMAND - Puppeteer Screenshots
// ============================================================================

async function takeScreenshot(sceneName, options = {}) {
  const spinner = ora(`Taking screenshot of ${sceneName}...`).start();

  try {
    await fs.ensureDir(SCREENSHOTS_DIR);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Load the game
    const gamePath = path.join(PROJECT_ROOT, 'trolley_game.html');
    await page.goto(`file://${gamePath}`, { waitUntil: 'networkidle0' });

    // Wait for Phaser to initialize
    await page.waitForFunction(() => {
      return window.Phaser && document.querySelector('canvas');
    }, { timeout: 10000 });

    // Navigate to specific scene if needed
    if (sceneName !== 'current') {
      await page.evaluate((scene) => {
        const game = Phaser.GAMES[0];
        if (game && game.scene) {
          game.scene.start(scene);
        }
      }, getSceneClassName(sceneName));

      // Wait for scene transition
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${sceneName}_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    await browser.close();

    spinner.succeed(chalk.green(`Screenshot saved: ${path.relative(PROJECT_ROOT, screenshotPath)}`));

    return { success: true, path: screenshotPath };

  } catch (error) {
    spinner.fail(chalk.red(`Screenshot failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

function getSceneClassName(sceneName) {
  const sceneMap = {
    'login': 'LoginScene',
    'menu': 'MainMenuScene',
    'level': 'LevelScene',
    'gameover': 'GameOverScene',
    'leaderboard': 'LeaderboardScene',
    'worldmap': 'WorldMapScene',
    'shop': 'ShopScene',
    'profile': 'ProfileScene'
  };
  return sceneMap[sceneName.toLowerCase()] || sceneName;
}

async function screenshotCommand(options) {
  console.log(chalk.cyan('\n=== SCREENSHOT CAPTURE ===\n'));

  const scenes = options.scene === 'all'
    ? ['login', 'menu', 'worldmap', 'shop', 'profile', 'level', 'gameover', 'leaderboard']
    : [options.scene || 'menu'];

  for (const scene of scenes) {
    await takeScreenshot(scene, options);
    if (scenes.indexOf(scene) < scenes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// ============================================================================
// REVIEW COMMAND - GPT-4V Style Review
// ============================================================================

async function reviewAsset(assetPath, options = {}) {
  const client = await getOpenAI();
  const styleGuide = await loadStyleGuide();
  const spinner = ora(`Reviewing ${path.basename(assetPath)}...`).start();

  // Check budget before reviewing
  if (!checkBudget(COSTS['gpt-4o-vision'])) {
    spinner.fail(chalk.red('Budget limit reached'));
    return { success: false, error: 'Budget limit reached' };
  }

  try {
    // Read the image file
    const imageBuffer = await fs.readFile(assetPath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = assetPath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Load reference images for comparison
    const referenceImages = [];
    const refPaths = [
      path.join(ASSETS_DIR, 'backgrounds', 'menu_bg.png'),
      path.join(ASSETS_DIR, 'buttons', 'button_startGame.png')
    ];

    for (const refPath of refPaths) {
      if (await fs.pathExists(refPath)) {
        const refBuffer = await fs.readFile(refPath);
        referenceImages.push({
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${refBuffer.toString('base64')}`,
            detail: 'low'
          }
        });
      }
    }

    // Build the review prompt
    const reviewPrompt = `You are a visual QA reviewer for a game called "The Trolley Problem".

Your task is to review the NEW ASSET (first image) against the STYLE GUIDE and REFERENCE ASSETS.

## Style Guide Summary
The game uses a "Vintage Railway Storybook" aesthetic:
- Studio Ghibli-inspired digital paintings (soft, painterly)
- Victorian industrial UI elements (brass, rivets, aged metal)
- Color palette: warm earth tones (brass #B8860B, brown #5D4037, green #4A6741, cream #F5DEB3)
- 1920s-1940s railway era atmosphere
- NOT pixel art, NOT photorealistic

## Review Criteria
Rate each criterion 1-10:

1. **Style Consistency**: Does it match the painterly, illustrated style?
2. **Color Palette**: Does it use warm brass, earth tones, and cream colors?
3. **Mood/Atmosphere**: Does it fit the vintage railway, morally-weighty mood?
4. **Technical Quality**: Is it clean, proper resolution, no artifacts?

## Response Format
Provide your review in this exact JSON format:
{
  "scores": {
    "styleConsistency": <1-10>,
    "colorPalette": <1-10>,
    "moodAtmosphere": <1-10>,
    "technicalQuality": <1-10>
  },
  "overallScore": <1-10 weighted average>,
  "passed": <true if overallScore >= 7>,
  "feedback": {
    "strengths": ["list", "of", "positives"],
    "issues": ["list", "of", "problems"],
    "suggestions": ["specific", "improvement", "suggestions"]
  },
  "regenerationPrompt": "<If failed, provide an improved DALL-E prompt that addresses the issues>"
}`;

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: reviewPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high'
            }
          },
          ...referenceImages
        ]
      }
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1500
    });

    // Track the cost
    trackCost('gpt-4o-vision');

    const reviewText = response.choices[0].message.content;

    // Parse JSON from response
    let review;
    try {
      const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      review = {
        overallScore: 5,
        passed: false,
        feedback: { raw: reviewText },
        parseError: true
      };
    }

    const statusColor = review.passed ? chalk.green : chalk.yellow;
    spinner.succeed(statusColor(
      `${path.basename(assetPath)}: ${review.overallScore}/10 - ${review.passed ? 'PASSED' : 'NEEDS WORK'}`
    ));

    return {
      success: true,
      assetPath,
      review
    };

  } catch (error) {
    spinner.fail(chalk.red(`Review failed: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
}

async function reviewCommand(options) {
  console.log(chalk.cyan('\n=== STYLE REVIEW ===\n'));

  let assetsToReview = [];

  if (options.id) {
    // Find specific asset file
    const manifest = await loadManifest();
    for (const cat of Object.keys(manifest.requiredAssets)) {
      const asset = manifest.requiredAssets[cat].find(a => a.id === options.id);
      if (asset) {
        let assetDir = ASSETS_DIR;
        if (cat === 'backgrounds') assetDir = path.join(ASSETS_DIR, 'backgrounds');
        else if (cat === 'buttons') assetDir = path.join(ASSETS_DIR, 'buttons');
        else if (cat === 'icons') assetDir = path.join(ASSETS_DIR, 'icons');

        const assetPath = path.join(assetDir, asset.file);
        if (await fs.pathExists(assetPath)) {
          assetsToReview.push(assetPath);
        } else {
          console.log(chalk.yellow(`Asset file not found: ${assetPath}`));
        }
        break;
      }
    }
  } else if (options.all || options.screenshots) {
    // Review all screenshots
    if (await fs.pathExists(SCREENSHOTS_DIR)) {
      const files = await fs.readdir(SCREENSHOTS_DIR);
      assetsToReview = files
        .filter(f => f.endsWith('.png'))
        .map(f => path.join(SCREENSHOTS_DIR, f));
    }
  } else if (options.category) {
    // Review all assets in a category
    let categoryDir = path.join(ASSETS_DIR, options.category);
    if (await fs.pathExists(categoryDir)) {
      const files = await fs.readdir(categoryDir);
      assetsToReview = files
        .filter(f => f.endsWith('.png'))
        .map(f => path.join(categoryDir, f));
    }
  }

  if (assetsToReview.length === 0) {
    console.log(chalk.yellow('No assets found to review.'));
    console.log('Use --id=<asset_id>, --category=<category>, --all, or --screenshots');
    return;
  }

  console.log(chalk.white(`Reviewing ${assetsToReview.length} assets...\n`));

  const results = { passed: [], failed: [] };

  for (const assetPath of assetsToReview) {
    const result = await reviewAsset(assetPath, options);
    if (result.success) {
      if (result.review.passed) {
        results.passed.push(result);
      } else {
        results.failed.push(result);
      }
    }

    // Delay between reviews
    if (assetsToReview.indexOf(assetPath) < assetsToReview.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log(chalk.cyan('\n=== REVIEW SUMMARY ===\n'));
  console.log(chalk.green(`Passed: ${results.passed.length}`));
  console.log(chalk.yellow(`Needs Work: ${results.failed.length}`));

  if (results.failed.length > 0) {
    console.log(chalk.yellow('\nAssets needing improvement:'));
    for (const { assetPath, review } of results.failed) {
      console.log(chalk.white(`\n${path.basename(assetPath)}:`));
      if (review.feedback?.issues) {
        review.feedback.issues.forEach(issue => {
          console.log(chalk.red(`  - ${issue}`));
        });
      }
      if (review.feedback?.suggestions) {
        console.log(chalk.cyan('  Suggestions:'));
        review.feedback.suggestions.forEach(suggestion => {
          console.log(chalk.cyan(`    - ${suggestion}`));
        });
      }
    }
  }
}

// ============================================================================
// PIPELINE COMMAND - Full Generation + Review Loop
// ============================================================================

async function pipelineCommand(options) {
  console.log(chalk.cyan('\n=== ASSET PIPELINE ===\n'));
  console.log(chalk.white('Running full generation and review cycle.\n'));

  const maxIterations = parseInt(options.maxIterations) || 3;
  const manifest = await loadManifest();
  const category = options.category || 'backgrounds';

  const assets = manifest.requiredAssets[category] || [];
  if (assets.length === 0) {
    console.log(chalk.red(`No assets found in category: ${category}`));
    return;
  }

  // Filter to high priority if specified
  const targetAssets = options.priority
    ? assets.filter(a => a.priority === options.priority)
    : assets;

  console.log(chalk.white(`Processing ${targetAssets.length} ${category}...\n`));

  for (const asset of targetAssets) {
    console.log(chalk.cyan(`\n--- Processing: ${asset.id} ---\n`));

    let currentAsset = { ...asset };
    let passed = false;
    let iteration = 0;

    while (!passed && iteration < maxIterations) {
      iteration++;
      console.log(chalk.white(`Iteration ${iteration}/${maxIterations}`));

      // Generate
      const genResult = await generateAsset(currentAsset, options);
      if (!genResult.success) {
        console.log(chalk.red(`Generation failed, skipping asset.`));
        break;
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Review
      const reviewResult = await reviewAsset(genResult.path, options);
      if (!reviewResult.success) {
        console.log(chalk.red(`Review failed, skipping asset.`));
        break;
      }

      if (reviewResult.review.passed) {
        passed = true;
        console.log(chalk.green(`\n${asset.id} APPROVED after ${iteration} iteration(s)!\n`));
      } else if (iteration < maxIterations && reviewResult.review.regenerationPrompt) {
        // Update prompt for next iteration
        console.log(chalk.yellow(`\nRegenerating with improved prompt...\n`));
        currentAsset = {
          ...currentAsset,
          prompt: reviewResult.review.regenerationPrompt
        };

        // Delay before retry
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    if (!passed) {
      console.log(chalk.yellow(`\n${asset.id} did not pass after ${maxIterations} iterations.`));
      console.log(chalk.white(`Manual review recommended.\n`));
    }
  }

  console.log(chalk.cyan('\n=== PIPELINE COMPLETE ===\n'));
  printCostSummary();
}

// ============================================================================
// STATUS COMMAND - Show Asset Status
// ============================================================================

async function statusCommand() {
  console.log(chalk.cyan('\n=== ASSET STATUS ===\n'));

  const manifest = await loadManifest();

  // Check existing assets
  console.log(chalk.white('Existing Assets:'));
  for (const cat of Object.keys(manifest.existingAssets)) {
    const assets = manifest.existingAssets[cat];
    console.log(chalk.cyan(`  ${cat}: ${assets.length} assets`));
  }

  console.log('');

  // Check required assets
  console.log(chalk.white('Required Assets:'));
  for (const cat of Object.keys(manifest.requiredAssets)) {
    const assets = manifest.requiredAssets[cat];
    let existing = 0;
    let missing = 0;

    for (const asset of assets) {
      let checkDir = ASSETS_DIR;
      if (cat === 'backgrounds') checkDir = path.join(ASSETS_DIR, 'backgrounds');
      else if (cat === 'buttons') checkDir = path.join(ASSETS_DIR, 'buttons');
      else if (cat === 'icons') checkDir = path.join(ASSETS_DIR, 'icons');
      else if (cat === 'frames') checkDir = path.join(ASSETS_DIR, 'frames');
      else if (cat === 'trolleySkins') checkDir = path.join(ASSETS_DIR, 'trolley_skins');

      const filePath = path.join(checkDir, asset.file);
      if (await fs.pathExists(filePath)) {
        existing++;
      } else {
        missing++;
      }
    }

    const statusColor = missing === 0 ? chalk.green : (existing > 0 ? chalk.yellow : chalk.red);
    console.log(statusColor(`  ${cat}: ${existing}/${assets.length} (${missing} missing)`));

    // Show missing assets
    if (missing > 0 && process.argv.includes('--verbose')) {
      for (const asset of assets) {
        let checkDir = ASSETS_DIR;
        if (cat === 'backgrounds') checkDir = path.join(ASSETS_DIR, 'backgrounds');
        else if (cat === 'buttons') checkDir = path.join(ASSETS_DIR, 'buttons');
        else if (cat === 'icons') checkDir = path.join(ASSETS_DIR, 'icons');

        const filePath = path.join(checkDir, asset.file);
        if (!await fs.pathExists(filePath)) {
          console.log(chalk.red(`    - ${asset.id} (${asset.priority})`));
        }
      }
    }
  }

  console.log(chalk.white('\nUse --verbose to see missing asset details.'));
}

// ============================================================================
// CLI SETUP
// ============================================================================

program
  .name('asset-pipeline')
  .description('Trolley Problem asset generation and review pipeline')
  .version('1.0.0')
  .option('-b, --budget <amount>', 'Maximum cost limit in dollars', '5.00')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.budget) {
      costLimit = parseFloat(opts.budget);
      console.log(chalk.cyan(`💰 Budget limit set to: $${costLimit.toFixed(2)}\n`));
    }
  });

program
  .command('generate')
  .description('Generate assets using DALL-E 3')
  .option('-c, --category <category>', 'Asset category (backgrounds, buttons, icons)')
  .option('-i, --id <id>', 'Specific asset ID to generate')
  .option('-p, --priority <priority>', 'Filter by priority (high, medium, low)')
  .option('-q, --quality <quality>', 'Image quality (standard, hd)', 'hd')
  .option('-s, --style <style>', 'Image style (vivid, natural)', 'vivid')
  .option('-v, --versions <n>', 'Generate N versions for selection (useful for text assets)', '1')
  .option('-t, --textless', 'Generate without text (for code overlay)')
  .option('--no-rembg', 'Skip automatic background removal with rembg')
  .action(generateCommand);

program
  .command('screenshot')
  .description('Take screenshots of game scenes')
  .option('-s, --scene <scene>', 'Scene to capture (all, login, menu, etc.)', 'menu')
  .action(screenshotCommand);

program
  .command('review')
  .description('Review assets using GPT-4V')
  .option('-i, --id <id>', 'Specific asset ID to review')
  .option('-c, --category <category>', 'Review all assets in category')
  .option('-a, --all', 'Review all generated assets')
  .option('--screenshots', 'Review screenshot images')
  .action(reviewCommand);

program
  .command('pipeline')
  .description('Run full generate + review loop')
  .option('-c, --category <category>', 'Asset category', 'backgrounds')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-m, --max-iterations <n>', 'Max generation attempts', '3')
  .action(pipelineCommand);

program
  .command('status')
  .description('Show asset generation status')
  .option('-v, --verbose', 'Show detailed missing assets')
  .action(statusCommand);

program.parse();
