# Zone Creation Guide

> **Purpose:** Step-by-step reference for adding new zones to The Trolley Problem game.
> **Last Updated:** January 19, 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Planning Phase](#2-planning-phase)
3. [Code Implementation](#3-code-implementation)
4. [Asset Creation](#4-asset-creation)
5. [Testing Checklist](#5-testing-checklist)
6. [Quick Reference](#6-quick-reference)

---

## 1. Overview

Adding a new zone requires modifications to:
- **Code:** `trolley_game.html` (single-file application)
- **Assets:** Zone icon, background image
- **Documentation:** Game design doc, screen flow diagram, assets manifest

### File Locations

| File | Purpose |
|------|---------|
| `trolley_game.html` | All game code (HTML, CSS, JavaScript) |
| `documentation/assets-manifest.json` | Asset generation prompts |
| `documentation/GAME_DESIGN_DOC.md` | Game design documentation |
| `documentation/SCREEN_FLOW_DIAGRAM.md` | Navigation flow documentation |
| `assets/icons/icon_zoneN.png` | World map zone icon |
| `assets/backgrounds/level_0N_background.png` | Gameplay background |

---

## 2. Planning Phase

### 2.1 Zone Theme Selection

Choose a theme that:
- Progresses logically from the previous zone
- Offers unique ethical dilemma contexts
- Fits the vintage/Victorian railway aesthetic

**Existing Themes:**
| Zone | Name | Theme | Setting |
|------|------|-------|---------|
| 1 | Starter Rails | Pastoral/Suburban | Quiet countryside |
| 2 | Industrial District | Factory/Steam | Industrial zone |
| 3 | City Center | Urban/Traffic | Busy city streets |
| 4 | Summit Line | Mountain/Alpine | Treacherous passes |

**Potential Future Themes:**
- Harbor Terminal (maritime/docks)
- Night Express (nocturnal/low visibility)
- Border Crossing (international/customs)
- Underground (tunnels/mining)

### 2.2 Difficulty Parameters

Follow the progression pattern:

| Parameter | Zone 1 | Zone 2 | Zone 3 | Zone 4 | Zone 5 (suggested) |
|-----------|--------|--------|--------|--------|-------------------|
| choicesPerLevel | 3 | 4 | 5 | 6 | 7 |
| difficultyMod | 1.0 | 1.3 | 1.6 | 1.9 | 2.2 |
| currencyBonus | 1.00 | 1.05 | 1.10 | 1.15 | 1.20 |

### 2.3 Question Design

Design 7 questions per zone with escalating risk/reward:

**Question Structure:**
```javascript
{
  prompt: 'Short question text?',  // Under 50 characters
  opts: [
    { text: 'Choice A', pts: X, hp: Y },
    { text: 'Choice B', pts: X, hp: Y }
  ]
}
```

**Point/HP Ranges by Zone Difficulty:**

| Zone | Safe Choice (pts/hp) | Risky Choice (pts/hp) |
|------|---------------------|----------------------|
| Zone 1 | 2-5 pts, 0 to +3 hp | 6-12 pts, -1 to -5 hp |
| Zone 2 | 3-6 pts, 0 to +2 hp | 9-15 pts, -2 to -4 hp |
| Zone 3 | 4-8 pts, 0 to +3 hp | 12-20 pts, -3 to -6 hp |
| Zone 4 | 5-10 pts, 0 to +3 hp | 16-25 pts, -5 to -8 hp |

### 2.4 Color Selection

Choose a distinct UI color (hex format) for the zone. Existing colors:
- Zone 1: `#4CAF50` (green)
- Zone 2: `#FF9800` (orange)
- Zone 3: `#E91E63` (pink/magenta)
- Zone 4: `#00BCD4` (cyan)

---

## 3. Code Implementation

### 3.1 Add Zone Configuration

**Location:** `trolley_game.html`, search for `const ZoneConfig`

Add new zone object to the `ZoneConfig` array:

```javascript
{
  id: N,                          // Next zone number
  name: 'Zone Name',              // Display name
  description: 'Brief tagline.',  // Shown in zone detail panel
  choicesPerLevel: X,             // Stages per level (follow progression)
  levelsRequired: 5,              // Always 5
  difficultyMod: X.X,             // Follow progression pattern
  unlockRequirement: 5,           // Levels needed from previous zone
  currencyBonus: X.XX,            // Follow progression pattern
  color: '#HEXCOLOR',             // Distinct UI color
  bgSuffix: 'level_0N_background.png'
}
```

### 3.2 Add Zone Questions

**Location:** `trolley_game.html`, search for `const ZonePrompts`

Add new zone entry to the `ZonePrompts` object:

```javascript
N: [ // Zone Name
  {prompt:'Question 1?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]},
  {prompt:'Question 2?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]},
  {prompt:'Question 3?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]},
  {prompt:'Question 4?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]},
  {prompt:'Question 5?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]},
  {prompt:'Question 6?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]},
  {prompt:'Question 7?',opts:[{text:'Choice A',pts:X,hp:Y},{text:'Choice B',pts:X,hp:Y}]}
]
```

### 3.3 Add Background Mapping

**Location:** `trolley_game.html`, search for `const bgMap`

Add the new zone to the background mapping:

```javascript
const bgMap = {
  1: 'assets/backgrounds/level_01_background.png',
  2: 'assets/backgrounds/level_02_background.png',
  3: 'assets/backgrounds/level_03_background.png',
  4: 'assets/backgrounds/level_04_background.png',
  N: 'assets/backgrounds/level_0N_background.png'  // Add this line
};
```

### 3.4 Add World Map Marker

**Location:** `trolley_game.html`, search for `<!-- Zone N-1:` (the previous zone marker)

Add connecting line in the SVG section:
```html
<!-- Line from Zone N-1 to Zone N -->
<line x1="XX%" y1="YY%" x2="XX%" y2="YY%" stroke="#4a3a20" stroke-width="4" stroke-linecap="round"/>
<line x1="XX%" y1="YY%" x2="XX%" y2="YY%" stroke="#8B7355" stroke-width="2" stroke-linecap="round" stroke-dasharray="8,4"/>
```

Add zone marker after the previous zone:
```html
<!-- Zone N: Zone Name -->
<div class="zone-marker" data-zone="N" style="position:absolute;left:XX%;top:YY%;width:min(100px, 20vw);height:min(100px, 20vw);cursor:pointer;transition:all 0.3s ease;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.7));">
  <img src="assets/icons/icon_zoneN.png" style="width:100%;height:100%;object-fit:contain;"/>
  <div class="zone-lock-overlay" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;">
    <img src="assets/icons/icon_locked.png" style="width:50%;height:50%;object-fit:contain;"/>
  </div>
</div>
```

**Position Guidelines (current layout):**
- Zone 1: left:15%, top:50%
- Zone 2: left:40%, top:25%
- Zone 3: left:65%, top:5%
- Zone 4: left:85%, top:25%

### 3.5 Update Debug Unlock Button (Optional)

**Location:** `trolley_game.html`, search for `const zones = [1, 2, 3, 4]`

Add the new zone number to the array:
```javascript
const zones = [1, 2, 3, 4, N];
```

---

## 4. Asset Creation

### 4.1 Add Assets to Manifest

**Location:** `documentation/assets-manifest.json`

Add zone icon entry in the `icons` section:
```json
{
  "id": "icon_zoneN",
  "file": "icon_zoneN.png",
  "priority": "high",
  "size": "128x128",
  "description": "Zone N [Theme] icon - [brief description]",
  "backgroundColor": "white",
  "prompt": "Circular brass medallion icon featuring [theme elements], [color tones], brass frame border with rivets, centered composition, isolated on solid white background, simple clean silhouette with solid defined edges, simple design, appealing design, game map marker icon, Victorian [theme] aesthetic, flat 2D artwork",
  "negativePrompt": "shadow, drop shadow, cast shadow, 3D effects, checkerboard, transparency pattern, fine details at edges, text, words"
}
```

Add background entry in the `backgrounds` section:
```json
{
  "id": "level_0N_background",
  "file": "level_0N_background.png",
  "priority": "high",
  "size": "1920x1080",
  "type": "gameplay",
  "description": "[Theme] description for gameplay",
  "prompt": "Railway tracks [theme-specific scene description], digital painting in Studio Ghibli style, [color palette], sense of [mood], game background asset, 16:9 aspect ratio, no text"
}
```

### 4.2 Generate Assets

Run the asset pipeline from the `tools` directory:

```bash
cd tools
node asset-pipeline.js generate --id=icon_zoneN
node asset-pipeline.js generate --id=level_0N_background
```

### 4.3 Verify Assets

Confirm assets were created:
- `assets/icons/icon_zoneN.png`
- `assets/backgrounds/level_0N_background.png`

---

## 5. Testing Checklist

### 5.1 World Map Testing
- [ ] Zone icon appears on world map in correct position
- [ ] Connecting line from previous zone is visible
- [ ] Zone shows as locked until previous zone completed
- [ ] Lock overlay displays correctly
- [ ] Zone detail panel shows correct name, description, difficulty

### 5.2 Unlock Testing
- [ ] Zone unlocks after completing 5 levels in previous zone
- [ ] Difficulty 2 unlocks after completing zone once
- [ ] Difficulty 3 unlocks after completing zone twice
- [ ] Debug unlock button (if present) unlocks the new zone

### 5.3 Gameplay Testing
- [ ] Correct background loads for the zone
- [ ] All 7 questions display properly
- [ ] Point values calculate correctly with zone modifier
- [ ] HP damage/healing works as expected
- [ ] Zone complete popup shows after level 5

### 5.4 Progression Testing
- [ ] Points earned are added to user currency
- [ ] Progress is saved correctly
- [ ] Returning to zone shows correct progress

---

## 6. Quick Reference

### Code Locations (Line Numbers May Vary)

| What | Search For |
|------|------------|
| Zone Config | `const ZoneConfig` |
| Zone Prompts | `const ZonePrompts` |
| Background Map | `const bgMap = {` |
| World Map Markers | `<!-- Zone Markers` |
| Debug Unlock | `const zones = [1, 2, 3, 4]` |

### Asset Pipeline Commands

```bash
# Generate zone icon
node asset-pipeline.js generate --id=icon_zoneN

# Generate background
node asset-pipeline.js generate --id=level_0N_background

# Check generation status
node asset-pipeline.js status
```

### Documentation Updates Needed

After adding a zone, update:
1. `GAME_DESIGN_DOC.md` - Zone tables, unlock chain, achievements
2. `SCREEN_FLOW_DIAGRAM.md` - Zone markers list
3. `assets-manifest.json` - Asset definitions (done during creation)

---

## Example: Zone 4 Implementation Summary

For reference, Zone 4 (Summit Line) was implemented with:

**Configuration:**
```javascript
{
  id: 4,
  name: 'Summit Line',
  description: 'Treacherous mountain passes await.',
  choicesPerLevel: 6,
  levelsRequired: 5,
  difficultyMod: 1.9,
  unlockRequirement: 5,
  currencyBonus: 1.15,
  color: '#00BCD4',
  bgSuffix: 'level_04_background.png'
}
```

**Questions Theme:** Mountain railway hazards
- Avalanche warnings
- Frozen tracks
- Stranded climbers
- Cliff edges and rockslides
- Blizzard conditions
- Unstable trestle bridges
- Altitude sickness

**Assets:**
- `icon_zone4.png` - Snow-capped mountain peak medallion
- `level_04_background.png` - Alpine railway with dramatic peaks

---

*This guide should be updated whenever the zone creation process changes.*
