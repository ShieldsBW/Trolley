# Trolley Problem Game - Visual Style Guide

> **Purpose**: This document defines the visual language for "The Trolley Problem" game. Use this as a reference for all asset generation, UI design, and visual consistency reviews.

---

## 1. Art Style Overview

### Core Aesthetic
**"Vintage Railway Storybook"** - A blend of:
- **Studio Ghibli-inspired** digital paintings (soft, painterly backgrounds)
- **Victorian industrial** UI elements (brass, rivets, aged metal)
- **Vintage railway poster** typography (serif fonts, cream/gold text)
- **Moral weight atmosphere** (dramatic lighting, consequential mood)

### Artistic Influences
- Studio Ghibli films (Spirited Away, Howl's Moving Castle) - for painterly landscapes
- Bioshock Infinite - for brass/industrial UI frames
- Vintage railway company posters (1920s-1940s) - for typography and signage
- Thomas Kinkade - for warm, glowing light sources

### Rendering Style
- **NOT pixel art** - Smooth, painterly digital illustration
- **NOT photorealistic** - Stylized, illustrated look
- Soft brushwork visible in backgrounds
- Atmospheric perspective (distant objects hazier)
- Warm, glowing light sources (headlights, fire, sunset)

---

## 2. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Trolley Green | `#4A6741` | 74, 103, 65 | Trolley body, positive action buttons |
| Brass Gold | `#B8860B` | 184, 134, 11 | UI frames, metallic accents |
| Warm Brown | `#5D4037` | 93, 64, 55 | UI backgrounds, wood elements |
| Cream Ivory | `#F5DEB3` | 245, 222, 179 | Text, highlights |
| Sunset Orange | `#E07020` | 224, 112, 32 | Sky accents, fire, warmth |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Sky Blue | `#87CEEB` | 135, 206, 235 | Daytime sky, peaceful scenes |
| Deep Night | `#1A1A2E` | 26, 26, 46 | Nighttime scenes, dramatic moments |
| Danger Red | `#8B4513` | 139, 69, 19 | Warning buttons (Quit), hazards |
| Grass Green | `#7CB342` | 124, 179, 66 | Pastoral landscapes |
| Smoke Gray | `#4A4A4A` | 74, 74, 74 | Smoke, shadows |

### Color Usage Rules

1. **Backgrounds**: Use gradient skies (never flat colors)
   - Daytime: Blue → soft white → hint of yellow at horizon
   - Sunset: Deep blue → orange → golden yellow
   - Night: Deep purple/blue → orange glow from fire/lights

2. **UI Elements**: Always use warm metallics (brass, bronze, copper)
   - Never use chrome, silver, or cold metals
   - Frames should have subtle gradient (lighter at top, darker at bottom)

3. **Text**: Cream/ivory (`#F5DEB3`) with subtle dark outline or shadow
   - Never pure white
   - Never colored text (except gold for currency)

4. **Semantic Colors**:
   - Green = Positive/Progress (Start Game, Next Level)
   - Brown = Neutral (Menu, Continue, Submit)
   - Red/Maroon = Negative/Exit (Quit, danger)

---

## 3. Typography

### Primary Font Style
**Vintage Serif** - Similar to:
- Playfair Display
- Bodoni
- Century Schoolbook
- Freight Display

### Text Hierarchy

| Element | Style | Color | Effects |
|---------|-------|-------|---------|
| Game Logo | Large serif, all caps | Cream with gold tint | Subtle outline, slight 3D |
| Button Text | Medium serif, all caps | Cream `#F5DEB3` | Subtle emboss/shadow |
| Headers | Large serif | Cream or Gold | Drop shadow |
| Body Text | Medium serif or clean sans | White or Cream | Text shadow for readability |
| UI Labels | Small caps serif | Gold `#FFD700` | None or subtle glow |

### Text Rules
1. **All caps** for buttons and headers
2. **Mixed case** only for body/descriptive text
3. Always add **text shadow** (2px, #000, 50% opacity) for readability over busy backgrounds
4. Letter spacing slightly expanded for headers
5. Never use decorative/script fonts

---

## 4. UI Components

### Button Design

**Standard Button Anatomy:**
```
┌─────────────────────────────────┐
│  ○                          ○  │  ← Corner rivets (brass circles)
│    ┌─────────────────────┐     │
│    │     BUTTON TEXT     │     │  ← Inset panel (darker)
│    └─────────────────────┘     │
│  ○                          ○  │
└─────────────────────────────────┘
     ↑ Brass/bronze outer frame
```

**Button Variants:**

| Type | Background | Frame | Usage |
|------|------------|-------|-------|
| Primary | Trolley Green `#4A6741` | Brass | Start Game, Next Level, positive actions |
| Secondary | Warm Brown `#5D4037` | Bronze | Menu, Continue, neutral actions |
| Danger | Maroon `#8B4513` | Copper | Quit, destructive actions |
| Disabled | Gray `#666666` | Dull brass | Locked/unavailable |

**Button States:**
- **Normal**: Base colors as defined
- **Hover**: Slightly brighter, subtle outer glow
- **Pressed**: Darker, inset shadow effect
- **Disabled**: Desaturated, reduced opacity

### Panel/Frame Design

**Standard Frame Elements:**
- Outer border: 3-5px brass/bronze with rounded corners
- Corner accents: Circular rivets or decorative bolts
- Inner area: Dark brown with subtle texture/grain
- Optional: Hazard stripes (yellow `#FFD700` / black) for warnings

**Frame Variants:**
- **Info Panel**: Plain brass frame, dark interior
- **Warning Panel**: Brass frame + hazard stripe header
- **Score/Stats**: Brass frame with plaque-style inset areas

### Icons & Symbols

**Style Guidelines:**
- Simple, recognizable silhouettes
- Brass/gold color for UI icons
- White with dark outline for in-game indicators
- Consistent 2-3px stroke weight

**Recommended Icons:**
| Symbol | Usage | Style |
|--------|-------|-------|
| Coin/Currency | Shop, rewards | Gold circle with embossed design |
| Heart | Health | Red with brass outline |
| Star | Points, achievements | Gold, 5-pointed |
| Lock | Locked content | Brass padlock |
| Gear | Settings | Brass cogwheel |

---

## 5. Background Specifications

### Scene Types

#### Type A: Pastoral/Peaceful (Daytime Gameplay)
- **Mood**: Calm before the storm, innocent choices
- **Elements**: Green rolling hills, blue sky, fluffy clouds, distant trees
- **Lighting**: Soft daylight, subtle shadows
- **Reference**: `level_01_background.png`

#### Type B: Dramatic/Tense (Menu, Transitions)
- **Mood**: Urgency, weight of decision
- **Elements**: Sunset/golden hour, motion blur, dynamic angles
- **Lighting**: Warm backlighting, rim lights on trolley
- **Reference**: `menu_bg.png`

#### Type C: Consequence/Dark (Game Over, Warnings)
- **Mood**: Aftermath, gravity of choices
- **Elements**: Night sky, fire/flames, smoke, destruction
- **Lighting**: Fire as primary light source, deep shadows
- **Reference**: `gameOver_bg.png`

### Background Composition Rules

1. **Railway tracks** should lead the eye (usually toward center or a fork)
2. **Horizon line** at upper third (leave room for UI at top)
3. **Foreground elements** at bottom (tracks, grass) for depth
4. **Atmospheric haze** increases with distance
5. **Light source** usually from upper-left or behind subject

### Required Backgrounds (To Generate)

| Asset | Type | Description |
|-------|------|-------------|
| `login_bg.png` | B | Misty railway station at dusk, single trolley waiting |
| `worldmap_bg.png` | A/B | Aerial view of branching railway network across varied terrain |
| `shop_bg.png` | Interior | Victorian railway station interior, brass fixtures, warm lighting |
| `profile_bg.png` | B | Conductor's cabin interior with controls and gauges |
| `level_02_background.png` | A→B | Industrial district, factories, steam, more urban |
| `level_03_background.png` | B | City scene, buildings, busier environment |

---

## 6. Character & Object Design

### The Trolley

**Design Specifications:**
- **Era**: 1920s-1940s electric streetcar/tram
- **Color**: Weathered green (`#4A6741`) with brass/gold trim
- **Features**:
  - Large front windows
  - Single glowing headlight (warm yellow)
  - Slightly rounded roof
  - Visible wear and patina
  - Number plate optional

**Trolley Variants (Cosmetics):**
| Skin | Primary Color | Accents | Special |
|------|---------------|---------|---------|
| Default | Weathered green | Brass | Standard |
| Golden | Polished gold | Bronze | Metallic sheen |
| Flame | Deep red/orange | Gold | Subtle fire particle effect |
| Frost | Ice blue | Silver (exception) | Frost/ice texture |
| Neon | Hot pink/purple | Chrome | Glowing edges |
| Shadow | Charcoal black | Dark brass | Smoky aura |

### Human Figures

**Style Guidelines:**
- Simplified, slightly stylized proportions
- Expressive faces visible even at small sizes
- Clothing appropriate to 1920s-1940s era
- Warm skin tones, avoid harsh outlines

---

## 7. Animation & Effects

### Recommended Effects

| Effect | Usage | Style |
|--------|-------|-------|
| Motion blur | Trolley movement | Horizontal streaks |
| Particle dust | Track movement | Small tan particles |
| Fire/flames | Destruction scenes | Orange/yellow, organic shapes |
| Smoke | Consequences | Gray, billowing, semi-transparent |
| Light rays | Dramatic moments | Golden, radiating from source |
| Sparks | Metal on metal | Small yellow/white points |

### Transition Recommendations
- Fade to black/sepia for scene changes
- Slight zoom for dramatic moments
- Avoid harsh cuts; prefer cross-dissolves

---

## 8. Asset Generation Prompts

### Template for DALL-E / Image Generation

**Base Prompt Structure:**
```
[Scene description], digital painting in Studio Ghibli style,
warm color palette with brass and earth tones,
vintage railway aesthetic, 1920s-1940s era,
soft painterly brushwork, atmospheric lighting,
[specific mood], game asset, 16:9 aspect ratio
```

**Example Prompts:**

**Login Background:**
```
A misty Victorian railway station at dusk, single green trolley
waiting at platform, gas lamps glowing warmly, digital painting
in Studio Ghibli style, warm color palette with brass and earth
tones, vintage railway aesthetic, 1920s-1940s era, soft painterly
brushwork, atmospheric fog, mysterious but inviting mood,
game background asset, 16:9 aspect ratio
```

**World Map Background:**
```
Aerial view of a vintage railway network spreading across
countryside, branching tracks connecting small towns and
industrial areas, soft clouds below, golden hour lighting,
digital painting in Studio Ghibli style, warm color palette
with greens and earth tones, vintage map aesthetic,
game background asset, 16:9 aspect ratio
```

**Shop Interior:**
```
Interior of a Victorian railway station gift shop, brass fixtures,
wooden display cases, warm gas lamp lighting, vintage travel
posters on walls, cozy and inviting atmosphere, digital painting
in Studio Ghibli style, warm browns and brass tones,
game background asset, 16:9 aspect ratio
```

**Button Template:**
```
Vintage railway sign button with text "[TEXT]", brass metal frame
with corner rivets, [green/brown/red] inset panel, cream colored
serif text, isolated on solid [white/black] background, simple
clean edges, game UI asset, Victorian industrial steampunk style,
no checkerboard pattern, no transparency pattern
```

---

## 9. Asset Generation Technical Guidelines

> **Critical**: This section covers technical requirements for generating assets that can be cleanly processed into game-ready PNGs with proper transparency.

### Background Color Rules

**NEVER use "transparent background" in prompts.** DALL-E interprets this literally and renders a checkerboard pattern as actual pixels, not alpha transparency.

Instead, use solid backgrounds that can be cleanly removed in post-processing:

| Asset Type | Background Color | Reason |
|------------|------------------|--------|
| **Buttons** (brass/brown) | Solid white `#FFFFFF` | High contrast with warm metal tones |
| **Icons** (gold/brass) | Solid white `#FFFFFF` | Gold pops against white |
| **Icons** (light/silver) | Solid black `#000000` | Light subjects need dark bg |
| **Frames** (brass/ornate) | Solid white `#FFFFFF` | Better edge definition |
| **Text/Logos** (cream/gold) | Solid black `#000000` | Light text needs dark bg |

**Prompt phrases to use:**
- ✅ "isolated on solid white background"
- ✅ "isolated on pure black background"
- ✅ "clean white backdrop, no patterns"
- ❌ "transparent background" (causes checkerboard)
- ❌ "PNG with transparency" (causes checkerboard)
- ❌ "cutout on transparent" (causes checkerboard)

### Silhouette Complexity Guidelines

Simpler silhouettes produce cleaner edges after background removal.

| Complexity | Description | Use For |
|------------|-------------|---------|
| **Simple** | Solid shapes, minimal protrusions | Icons, small buttons |
| **Medium** | Some detail, but contained outline | Standard buttons, frames |
| **Complex** | Fine details, wisps, gradients at edges | Backgrounds only (no transparency needed) |

**Prompt phrases for cleaner edges:**
- "simple clean silhouette"
- "solid defined edges"
- "minimal fine details at edges"
- "contained shape with clear boundary"
- "no wispy or feathered edges"
- "bold graphic shapes"

**Avoid for transparent assets:**
- "ornate filigree edges"
- "smoky/misty borders"
- "glowing aura" (unless fully contained)
- "particle effects at edges"

### Icon-Specific Guidelines

Icons need to work at small sizes (32-64px display) so they require:

1. **Bold, recognizable shapes** - Must read clearly at thumbnail size
2. **High contrast** - Strong value difference between icon and background
3. **Centered composition** - Subject fills frame with small margin
4. **Flat or simple shading** - Avoid complex gradients that muddy at small sizes

**Icon prompt template:**
```
[Subject description], simple bold graphic icon design,
centered composition, solid defined edges, metallic brass/gold finish,
isolated on solid white background, 64x64 game icon,
clean vector-like quality, no fine details, high contrast
```

### Button-Specific Guidelines

Buttons need consistent proportions and readable text:

1. **Horizontal orientation** - Wider than tall (roughly 3:1 ratio)
2. **Text clarity** - Large enough text to read, high contrast
3. **Contained frame** - All decorative elements stay within bounds
4. **Consistent corner treatment** - Rivets/accents in predictable positions
5. **Simple, appealing design** - Clean aesthetic that works at various sizes

**Button prompt template:**
```
Positive: Vintage railway sign button reading "[TEXT]", horizontal rectangle,
brass metal frame with corner rivets, [color] inset panel, cream colored
serif text clearly readable, isolated on solid white background, simple
contained shape, simple design, appealing design, game UI button,
Victorian style, flat 2D artwork

Negative: shadow, drop shadow, cast shadow, 3D effects, checkerboard,
transparency pattern, gradient background
```

### Prompt Structure: Positive vs Negative

Structure prompts with clear separation between what you want (positive) and what to avoid (negative):

**Positive prompts** describe desired qualities:
- "simple design, appealing design"
- "flat 2D artwork"
- "clean solid edges"
- "isolated on solid white background"

**Negative prompts** list things to exclude (just the terms, not "no X"):
- "shadow, drop shadow, cast shadow"
- "checkerboard, transparency pattern"
- "3D effects, depth, ambient occlusion"
- "gradient background"

In the manifest, use separate `prompt` and `negativePrompt` fields. The pipeline combines them appropriately.

### Text in Generated Images

DALL-E frequently misspells text. This is a known limitation.

**To minimize errors:**
1. **Keep text short** - Single words or 2-word phrases work best
2. **Use common words** - Avoid unusual spellings
3. **Spell out in prompt** - Write exact text in quotes

**Common DALL-E text errors:**
- Doubled letters ("CREATTE" instead of "CREATE")
- Missing letters ("PROFLE" instead of "PROFILE")
- Swapped letters ("SAHOP" instead of "SHOP")
- Random gibberish characters

**Generation protocol for text assets:**
1. Generate up to 3 variations, saving each as `_v1`, `_v2`, `_v3`
2. Present all 3 for user review and selection
3. If all 3 have spelling errors, generate 3 textless versions
4. Overlay text via CSS/code for guaranteed accuracy

**Post-generation checklist:**
- [ ] Verify spelling is correct letter-by-letter
- [ ] Check all letters are present
- [ ] Ensure text is readable at target display size
- [ ] Select best version or request textless fallback

### Post-Processing Expectations

Assets generated with these guidelines should be processed as follows:

1. **Flood-fill removal** - Remove background color starting from corners
2. **Tolerance**: ~15-25 for white backgrounds, ~10-15 for black
3. **Edge smoothing** - Apply 1px anti-aliasing to edges
4. **Trim** - Crop to content bounds with small margin
5. **Final size** - Scale to target dimensions

### Prompt Checklist

Before generating any transparent asset, verify:

**Positive prompt includes:**
- [ ] Solid background color specified (white or black)
- [ ] "simple design, appealing design"
- [ ] "flat 2D artwork" or "flat illustration"
- [ ] Edge treatment ("clean solid edges", "contained shape")
- [ ] Composition guidance ("centered", "contained")
- [ ] Target use case ("game UI", "icon", "button")
- [ ] For text: exact spelling in quotes

**Negative prompt includes:**
- [ ] "shadow, drop shadow, cast shadow"
- [ ] "checkerboard, transparency pattern"
- [ ] "3D effects" (if flat art desired)

---

## 10. Quality Checklist

### For GPT-4V Review

When reviewing generated assets, check:

**Style Consistency (1-10):**
- [ ] Matches painterly/illustrated style (not photorealistic)
- [ ] Color palette within defined ranges
- [ ] Appropriate level of detail (not too busy)
- [ ] Consistent with existing assets' mood

**Technical Quality (1-10):**
- [ ] Correct aspect ratio
- [ ] Sufficient resolution (min 1920x1080 for backgrounds)
- [ ] No artifacts or distortions
- [ ] Clean edges (for UI elements)

**Thematic Fit (1-10):**
- [ ] Matches the era (1920s-1940s railway)
- [ ] Appropriate mood for intended use
- [ ] Contains expected elements (tracks, trolley, etc.)
- [ ] No anachronistic elements

**Review Prompt for GPT-4V:**
```
Review this game asset against the style guide. Rate 1-10 on:
1. Style consistency with existing assets
2. Color palette adherence
3. Mood/atmosphere appropriateness
4. Technical quality

Provide specific feedback on what matches and what needs adjustment.
Reference the existing assets: [attach reference images]
```

---

## 11. File Specifications

### Backgrounds
- **Format**: PNG (24-bit, no transparency)
- **Resolution**: 1920 x 1080 pixels minimum
- **Naming**: `[scene]_bg.png` (e.g., `login_bg.png`)

### Buttons
- **Format**: PNG (32-bit with transparency)
- **Resolution**: Variable, maintain aspect ratio
- **Naming**: `button_[action].png` (e.g., `button_shop.png`)

### Icons
- **Format**: PNG (32-bit with transparency)
- **Resolution**: 64x64, 128x128, or 256x256
- **Naming**: `icon_[name].png` (e.g., `icon_currency.png`)

### Text/Logos
- **Format**: PNG (32-bit with transparency)
- **Resolution**: As needed, vector-quality edges
- **Naming**: `text_[name].png` (e.g., `text_zoneComplete.png`)

---

## Appendix A: Existing Asset Reference

| Asset | File | Key Characteristics |
|-------|------|---------------------|
| Menu BG | `menu_bg.png` | Sunset, dramatic angle, trolley at junction |
| Level 01 BG | `level_01_background.png` | Pastoral, peaceful, forked tracks, daytime |
| Game Over BG | `gameOver_bg.png` | Night, burning trolley, dark and dramatic |
| Leaderboard Frame | `leaderboard_bg.png` | Brass frame, rivets, dark interior |
| Consequence Frame | `consequence_bg.png` | Brass frame, hazard stripes, warning plate |
| Start Button | `button_startGame.png` | Green, brass frame, cream text |
| Quit Button | `button_quit.png` | Red/maroon, brass frame |
| Logo | `textLogo.png` | Cream/gold, serif, outlined |
| Game Over Text | `text_gameOver.png` | Copper/bronze, 3D metallic |

---

## Appendix B: Assets Needed

### High Priority
- [ ] `login_bg.png` - Login scene background
- [ ] `worldmap_bg.png` - World map background
- [ ] `shop_bg.png` - Shop scene background
- [ ] `profile_bg.png` - Profile scene background
- [ ] `button_shop.png` - Shop navigation button
- [ ] `button_profile.png` - Profile navigation button
- [ ] `button_back.png` - Back/return button
- [ ] `button_buy.png` - Purchase button
- [ ] `button_equip.png` - Equip cosmetic button

### Medium Priority
- [ ] `level_02_background.png` - Industrial zone background
- [ ] `level_03_background.png` - City zone background
- [ ] `icon_currency.png` - Currency/coin icon
- [ ] `icon_health.png` - Health/heart icon
- [ ] Zone selection cards/frames

### Lower Priority
- [ ] Trolley skin preview images
- [ ] Achievement icons
- [ ] Consumable item icons
- [ ] Additional consequence backgrounds

---

*Document Version: 1.1*
*Last Updated: January 17, 2026*
*For use with automated asset generation pipeline*
