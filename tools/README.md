# Asset Generation Pipeline

Automated tool for generating, reviewing, and iterating on game assets using AI.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DALL-E 3  │────▶│   Assets    │────▶│   GPT-4V    │
│  (Generate) │     │  (Storage)  │     │  (Review)   │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │                                       │
       └───────────── Feedback Loop ───────────┘
```

## Setup

1. **Install dependencies:**
   ```bash
   cd tools
   npm install
   ```

2. **Configure API key** (choose one):
   - Add key to `documentation/keys.txt`
   - Or copy `.env.example` to `.env` and add key there
   - Or set `OPENAI_API_KEY` environment variable

## Commands

### Generate Assets

```bash
# Generate all required assets
npm run generate

# Generate specific category
npm run generate:backgrounds
npm run generate:buttons
npm run generate:icons

# Generate single asset
node asset-pipeline.js generate --id=login_bg

# Generate only high-priority assets
node asset-pipeline.js generate --priority=high
```

### Take Screenshots

```bash
# Screenshot current scene
npm run screenshot

# Screenshot all scenes
node asset-pipeline.js screenshot --scene=all

# Screenshot specific scene
node asset-pipeline.js screenshot --scene=shop
```

### Review Assets

```bash
# Review all screenshots
npm run review

# Review specific asset
node asset-pipeline.js review --id=login_bg

# Review all assets in category
node asset-pipeline.js review --category=backgrounds
```

### Full Pipeline

```bash
# Run generate + review loop (max 3 iterations per asset)
npm run pipeline

# Pipeline for specific category
node asset-pipeline.js pipeline --category=buttons --max-iterations=5
```

### Check Status

```bash
# Show what assets exist vs missing
npm run status

# Show detailed missing assets
node asset-pipeline.js status --verbose
```

## How It Works

### Generation
1. Reads asset definitions from `documentation/assets-manifest.json`
2. Uses pre-written prompts tuned to match the style guide
3. Calls DALL-E 3 API to generate images
4. Saves to appropriate `assets/` subdirectory

### Review
1. Loads the generated image
2. Loads reference images (menu_bg.png, button_startGame.png)
3. Sends to GPT-4V with style guide summary
4. GPT-4V scores on 4 criteria (1-10 each):
   - Style Consistency
   - Color Palette
   - Mood/Atmosphere
   - Technical Quality
5. Returns PASS (>=7) or FAIL with feedback

### Pipeline Loop
1. Generate asset
2. Review asset
3. If failed and iterations remaining:
   - Use GPT-4V's suggested improved prompt
   - Regenerate
   - Review again
4. Repeat until passed or max iterations reached

## Configuration

Edit `documentation/assets-manifest.json` to:
- Add new assets to generate
- Modify generation prompts
- Adjust review thresholds

Edit `documentation/STYLE_GUIDE.md` to:
- Update visual style rules
- Change color palette
- Modify review criteria

## Cost Estimates

| Action | Model | Est. Cost |
|--------|-------|-----------|
| Generate 1 background | DALL-E 3 HD | ~$0.08 |
| Generate 1 button/icon | DALL-E 3 HD | ~$0.08 |
| Review 1 asset | GPT-4V | ~$0.02 |
| Full pipeline (3 iterations) | Combined | ~$0.30/asset |

## Troubleshooting

**"API key not found"**
- Ensure key is in `documentation/keys.txt` or `.env`

**"Rate limit exceeded"**
- The script includes delays between requests
- Wait a minute and try again

**"Screenshot failed"**
- Ensure no other browser is blocking Puppeteer
- Try running with `--no-sandbox` flag

**"Review always fails"**
- Check that reference images exist in assets/
- Lower the threshold in manifest if needed
