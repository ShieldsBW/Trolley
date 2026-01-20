# The Trolley Problem - Game Design Document

> **Version:** 1.1
> **Last Updated:** January 19, 2026
> **Status:** Living Document - Updated as features evolve

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Core Gameplay](#2-core-gameplay)
3. [Progression System](#3-progression-system)
4. [Economy & Shop](#4-economy--shop)
5. [Meta Systems](#5-meta-systems)
6. [User Interface](#6-user-interface)
7. [Technical Architecture](#7-technical-architecture)
8. [Content Guidelines](#8-content-guidelines)
9. [Future Considerations](#9-future-considerations)

---

## 1. Game Overview

### 1.1 Concept

**The Trolley Problem** is a single-player browser-based decision game inspired by the classic philosophical thought experiment. Players navigate a runaway trolley through a series of moral dilemmas, making split-second decisions that affect their score and survival.

### 1.2 Genre & Platform

| Attribute | Value |
|-----------|-------|
| Genre | Puzzle / Decision / Casual |
| Platform | Web Browser (file:// compatible) |
| Engine | Phaser.js 3.x |
| Target Audience | Casual gamers, philosophy enthusiasts |
| Session Length | 5-15 minutes per run |

### 1.3 Core Pillars

1. **Meaningful Choices** - Every decision has consequences (points vs. health trade-offs)
2. **Risk vs. Reward** - Higher-risk choices yield more points but cost health
3. **Progression** - Unlock new zones with increasing difficulty and stakes
4. **Customization** - Express yourself through trolley cosmetics
5. **Replayability** - Zone-themed dilemmas, difficulty tiers, and achievements

### 1.4 Visual Style

**"Vintage Railway Storybook"** aesthetic combining:
- Studio Ghibli-inspired painterly backgrounds
- Victorian industrial brass/copper UI elements
- 1920s-1940s railway poster typography
- Warm, atmospheric lighting

*See `STYLE_GUIDE.md` for complete visual specifications.*

---

## 2. Core Gameplay

### 2.1 Game Loop

```
┌─────────────────────────────────────────────────────┐
│                    LEVEL START                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              PRESENT DILEMMA                         │
│  • Question text displayed in frame                  │
│  • Two choice buttons appear                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              PLAYER CHOOSES                          │
│  • Left track OR Right track                         │
│  • Each has different points/HP outcomes             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           SHOW CONSEQUENCE                           │
│  • Points gained/lost                                │
│  • Health change (+/-)                               │
│  • Brief pause for feedback                          │
└──────────────────────┬──────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
     (HP > 0 && stages left)   (HP <= 0)
            │                     │
            ▼                     ▼
     Next Stage/Level        GAME OVER
```

### 2.2 Health System

| Parameter | Value | Notes |
|-----------|-------|-------|
| Starting Health | 10 HP | Same for all zones/difficulties |
| Maximum Health | 20 HP | Caps healing effects |
| Death Threshold | 0 HP | Triggers Game Over |

**Health Changes:**
- Dilemma choices can add or subtract HP
- Health packs restore HP (consumable items)
- No passive regeneration

### 2.3 Points System

**Base Points Calculation:**
```
Final Points = Base Choice Points × Zone Modifier × Difficulty Modifier × Item Multiplier
```

**Modifiers:**

| Zone | Zone Modifier | Currency Bonus |
|------|---------------|----------------|
| Zone 1 (Starter Rails) | 1.0x | 1.00x |
| Zone 2 (Industrial) | 1.3x | 1.05x |
| Zone 3 (City Center) | 1.6x | 1.10x |
| Zone 4 (Summit Line) | 1.9x | 1.15x |

| Difficulty | Additional Modifier |
|------------|---------------------|
| Difficulty 1 | +0.0 |
| Difficulty 2 | +0.3 |
| Difficulty 3 | +0.6 |

**Bonuses:**
- **Perfect Level Bonus:** +50% if no damage taken during level
- **Minimum Points:** 1 point (prevents negative/zero rewards)

### 2.4 Dilemma Design

Each dilemma presents a binary choice with trade-offs:

```
┌─────────────────────────────────────────────────────┐
│  "Warn engineer or do nothing?"                     │
│                                                      │
│  [WARN: +10 pts, -1 HP]    [NOTHING: +0 pts, 0 HP]  │
└─────────────────────────────────────────────────────┘
```

**Design Principles:**
1. No "correct" answer - both choices are valid strategies
2. High-risk = high-reward (more points, more HP cost)
3. Safe choices exist but yield fewer points
4. Some choices can restore HP (strategic recovery)

**Choice Outcome Ranges:**

| Risk Level | Points | HP Change |
|------------|--------|-----------|
| Safe | 0-5 | 0 to +3 |
| Moderate | 5-12 | -1 to -3 |
| Risky | 12-20 | -4 to -6 |

---

## 3. Progression System

### 3.1 Zone Structure

The game features 4 zones with escalating challenge:

| Zone | Name | Stages/Level | Levels | Theme |
|------|------|--------------|--------|-------|
| 1 | Starter Rails | 3 | 5 | Suburban, pastoral |
| 2 | Industrial District | 4 | 5 | Factories, steam |
| 3 | City Center | 5 | 5 | Urban, high-stakes |
| 4 | Summit Line | 6 | 5 | Mountain railway, treacherous passes |

### 3.2 Unlock Requirements

```
Zone 1: Always unlocked
    │
    │ (Complete 5 levels)
    ▼
Zone 2: Unlocked
    │
    │ (Complete 5 levels)
    ▼
Zone 3: Unlocked
    │
    │ (Complete 5 levels)
    ▼
Zone 4: Unlocked
```

### 3.3 Difficulty Tiers

Each zone has 3 difficulty levels:

| Difficulty | Unlock Requirement | Point Multiplier |
|------------|-------------------|------------------|
| Difficulty 1 | Zone unlocked | Base |
| Difficulty 2 | Complete zone once | +0.3x |
| Difficulty 3 | Complete zone twice | +0.6x |

### 3.4 Level Flow

```
Zone Start
    │
    ├── Level 1 (3-5 stages depending on zone)
    │       └── Complete → Level 2
    ├── Level 2
    │       └── Complete → Level 3
    ├── Level 3
    │       └── Complete → Level 4
    ├── Level 4
    │       └── Complete → Level 5
    └── Level 5
            └── Complete → ZONE COMPLETE
                              │
                              ▼
                    Next Zone Unlocked (or All Complete)
```

### 3.5 Zone Completion

When all 5 levels of a zone are completed:
1. **Zone Complete Popup** appears with animation
2. **Next zone** is unlocked (if available)
3. **Next difficulty tier** unlocked for completed zone
4. Progress saved to user data

---

## 4. Economy & Shop

### 4.1 Currency

**Points** serve as the universal currency:
- Earned through gameplay choices
- Persistent across sessions
- Spent in the Shop

**Earning Rate:**
```
Currency Earned = Level Points × Zone Currency Bonus
```

### 4.2 Shop Categories

#### Cosmetics (Permanent Unlocks)

| Item | Price | Description |
|------|-------|-------------|
| Standard Trolley | Free | Default skin |
| Golden Trolley | 500 | Polished gold finish |
| Flame Trolley | 750 | Fiery gradient paint |
| Frost Trolley | 750 | Ice blue crystalline |
| Neon Trolley | 1000 | Glowing pink/cyan accents |
| Shadow Trolley | 1500 | Dark mysterious aesthetic |

#### Consumables (Stackable)

| Item | Price | Effect | Usage |
|------|-------|--------|-------|
| Small Health Pack | 100 | +3 HP | During level |
| Large Health Pack | 250 | +7 HP | During level |
| Point Booster | 200 | 2x Points (1 level) | Once per level |

### 4.3 Item Usage Rules

- **Max 3 items per level** (prevents trivializing difficulty)
- Point Booster limited to **once per level**
- Items consumed on use (deducted from inventory)
- Item bar visible during gameplay (left side, vertical layout)
- Inventory overlay accessible via HUD backpack button (🎒)

### 4.4 Shop UI

```
┌─────────────────────────────────────────┐
│              SHOP                        │
│         💰 1,250 Points                  │
├─────────────────────────────────────────┤
│  [Cosmetics]  [Consumables]              │  ← Tabs
├─────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐                │
│  │     │ │     │ │     │                │  ← 2x3 Grid
│  │     │ │     │ │     │                │
│  └─────┘ └─────┘ └─────┘                │
│  ┌─────┐ ┌─────┐ ┌─────┐                │
│  │     │ │     │ │     │                │
│  │     │ │     │ │     │                │
│  └─────┘ └─────┘ └─────┘                │
├─────────────────────────────────────────┤
│       ← Page 1 / 1 →                    │  ← Pagination
│         [Back]                           │
└─────────────────────────────────────────┘
```

---

## 5. Meta Systems

### 5.1 User Accounts

**Account Types:**
- **Guest:** Auto-generated username (Guest_XXXXX), local storage only
- **Registered:** Custom username, prepared for future backend sync

**Stored Data:**
```javascript
{
  userId: "uuid",
  username: "PlayerName",
  createdAt: timestamp,
  lastLogin: timestamp,
  progress: {
    currentZone: 1,
    completedLevels: [{zone, level, difficulty}],
    zoneCompletions: {1: 2, 2: 1}  // times completed
  },
  stats: {
    totalGames: 0,
    totalPoints: 0,
    choicesMade: 0,
    perfectLevels: 0
  },
  inventory: {
    currency: 0,
    cosmetics: ["trolley_default"],
    consumables: {hp_small: 0, hp_large: 0, point_boost: 0}
  },
  equipped: {
    trolleyAppearance: "trolley_default"
  },
  achievements: []
}
```

### 5.2 Achievement System

| Achievement | Requirement | Icon |
|-------------|-------------|------|
| First Steps | Complete first game | 🎮 |
| Starter Champion | Complete Zone 1 | 🏆 |
| Industrial Expert | Complete Zone 2 | 🏭 |
| City Master | Complete Zone 3 | 🌆 |
| Summit Conqueror | Complete Zone 4 | 🏔️ |
| Perfect Run | Complete level with no damage | ⭐ |
| Shopaholic | Purchase first item | 🛒 |
| Collector | Own 3+ cosmetics | 🎨 |
| Veteran | Play 10+ games | 🎖️ |

### 5.3 Profile Screen

**Tabs:**
1. **Stats** - User info, play statistics
2. **Inventory** - Owned skins and consumables
3. **Achievements** - Earned badges

**Stats Displayed:**
- Points (currency)
- Games Played
- Total Points Earned
- Choices Made
- Perfect Levels
- Levels Completed

### 5.4 Leaderboard

- Top 10 scores displayed
- Shows initials + score
- Submit score after Game Over
- Local storage (prepared for backend)

---

## 6. User Interface

### 6.1 Scene Navigation

```
LoginScene ──→ MainMenuScene ←──┐
                    │           │
        ┌───────────┼───────────┼───────────┐
        ▼           ▼           ▼           │
   WorldMap      Shop      Profile          │
        │                                   │
        ▼                                   │
   LevelScene ──→ GameOver ─────────────────┘
```

### 6.2 HUD Layout (Gameplay)

```
┌─────────────────────────────────────────────────────┐
│ Health: 10    Points: 150    │    Level: 1  Stage: 2│
│                              │    Zone: Starter     │
│                              │    [🎒] [🔍]         │
├─────────────────────────────────────────────────────┤
│        │                                             │
│ Items  │        [DILEMMA QUESTION]                  │
│ [+3HP] │                                             │
│ [+7HP] │    [CHOICE A]         [CHOICE B]           │
│ [2xPts]│                                             │
│ (0/3)  │                                             │
├────────┴────────────────────────────────────────────┤
│    ●────●────●────●────●   [🚃]     [Menu] [Quit]  │
│        Zone Progress Tracker                        │
└─────────────────────────────────────────────────────┘
```

**Item Bar:** Positioned on left side, vertical layout, shows owned consumables
**Zone Progress Tracker:** Visual path at bottom showing player's choices through the level with animated trolley

### 6.3 UI Principles

From the Style Guide:

1. **No Scroll Bars** - Use pagination and scaling instead
2. **Frame-Based Layouts** - Content within decorative brass frames
3. **Responsive Sizing** - Use `clamp()` and viewport units
4. **Gold Accent Color** - #FFD700 for highlights and titles
5. **Tan Body Text** - #F5DEB3 for readability
6. **Text Shadows** - Always for contrast over busy backgrounds

### 6.4 Debug Mode

Hold magnifying glass button (top-right during gameplay) to show colored outlines:
- Red: Frames
- Yellow: Text
- Cyan: Buttons
- Magenta: Containers

---

## 7. Technical Architecture

### 7.1 File Structure

```
/trolley_game.html     ← Single-file application
/assets/
  /backgrounds/        ← Scene backgrounds
  /buttons/            ← UI buttons
  /frames/             ← Decorative frames
  /text/               ← Text images, logos
  /trolley_skins/      ← Cosmetic previews
/documentation/
  /GAME_DESIGN_DOC.md  ← This document
  /STYLE_GUIDE.md      ← Visual specifications
  /SCREEN_FLOW_DIAGRAM.md
/tools/
  /asset-pipeline.js   ← AI asset generation
  /rembg-remove.py     ← Background removal
```

### 7.2 Technology Stack

| Component | Technology |
|-----------|------------|
| Game Engine | Phaser.js 3.80.1 |
| UI Layer | DOM Elements + CSS |
| Data Storage | localStorage |
| Asset Generation | DALL-E 3 + rembg |

### 7.3 Data Persistence

- All user data stored in `localStorage` under key `trolley_user`
- Debounced saves (500ms) to prevent excessive writes
- Version field for future migrations
- Designed for future backend sync

### 7.4 Performance Optimizations

- UIManager singleton for DOM element caching
- DocumentFragment for batch DOM updates
- Responsive breakpoints for mobile/tablet/desktop
- Efficient scene transitions

### 7.5 Mobile Support

The game supports mobile devices with responsive layouts:

**Portrait Mode:**
- Scaled UI elements for smaller screens
- Touch-friendly button sizes (minimum 44px touch targets)

**Landscape Mode (Primary Mobile Experience):**
- Optimized layout for max-height: 480px viewports
- Compact HUD with reduced text sizes
- Item bar on left side with vertical layout
- Zone progress tracker spans bottom of screen
- Level complete UI positioned above tracker
- Shop/Profile frames repositioned for landscape

**Responsive Features:**
- CSS `clamp()` for fluid typography
- Viewport-relative sizing (vw, vh, calc)
- Media queries for orientation and height breakpoints

### 7.6 Zone Progress Tracker

Visual feedback system showing player's path through a level:

**Features:**
- SVG-based branching path visualization
- Animated trolley icon following player's choices
- Gold highlights for chosen path, gray for unchosen
- Dynamic scaling/centering when paths drift up/down
- Resets automatically on level completion or Try Again
- Updates equipped trolley skin from cosmetics

**Technical Details:**
- Two-pass rendering: calculate extents, then draw with transforms
- CSS transitions for smooth trolley movement
- Properly handles container visibility for dimension calculations

---

## 8. Content Guidelines

### 8.1 Dilemma Writing

**Tone:** Serious but not graphic. Focus on the decision, not gore.

**Good Example:**
> "Warn the workers or maintain speed?"

**Bad Example:**
> "Watch workers get crushed or slow down?"

**Structure:**
- Clear, concise question (under 50 characters)
- Two distinct options
- Each option has points AND health consequences

### 8.2 Adding New Zones

To add a new zone:

1. Add entry to `ZoneConfig` array:
```javascript
{
  id: 4,
  name: 'Zone Name',
  description: 'Brief description',
  choicesPerLevel: 5,  // Stages per level
  levelsRequired: 5,
  difficultyMod: 1.9,
  unlockRequirement: 5,  // Levels from previous zone
  currencyBonus: 1.15,
  color: '#hexcolor',
  bgSuffix: 'level_04_background.png'
}
```

2. Add zone prompts to `ZonePrompts` object
3. Generate background asset
4. Test unlock flow

### 8.3 Adding New Shop Items

**Cosmetics:**
```javascript
{
  id: 'trolley_newname',
  name: 'Display Name',
  price: 1000,
  owned: false,
  color: '#fallback',
  preview: 'assets/trolley_skins/trolley_preview_newname.png'
}
```

**Consumables:**
```javascript
{
  id: 'item_id',
  name: 'Display Name',
  price: 150,
  effect: '+5 HP',
  value: 5,
  type: 'health',  // or 'multiplier'
  buttonId: 'item-new-id',
  buttonLabel: 'Button Text',
  buttonColor: '#hexcolor',
  icon: '🔷'
}
```

### 8.4 Adding Achievements

```javascript
{
  id: 'achievement_id',
  name: 'Achievement Name',
  desc: 'Description of how to earn it',
  icon: '🏅',
  condition: (user) => {
    // Return true when earned
    return user.stats.someValue >= threshold;
  }
}
```

---

## 9. Future Considerations

### 9.1 Planned Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Backend Sync | High | User accounts, cloud saves |
| More Zones | Medium | Zones 5-6 with new themes (Zone 4 completed) |
| Daily Challenges | Medium | Special dilemmas with bonus rewards |
| Sound Effects | Medium | Audio feedback for choices |
| Multiplayer Race | Low | Compete for speed/score |

**Recently Completed:**
- ✅ Animated Trolley - Zone Progress Tracker with animated trolley visualization
- ✅ Mobile Support - Full responsive layout for portrait and landscape modes

### 9.2 Balancing Guidelines

When adjusting game balance:

1. **Test full zone runs** - Not just individual levels
2. **Monitor currency inflation** - Players shouldn't max out shop quickly
3. **Preserve risk/reward** - Safe play = slow progress, risky play = fast but fragile
4. **Difficulty 3 should feel hard** - But still beatable with skill

### 9.3 Monetization Considerations

Current: Free to play, no monetization

Potential future options (if needed):
- Cosmetic-only premium skins
- Remove ads tier (if ads added)
- Supporter badge

**Never:** Pay-to-win items, gameplay advantages for purchase

---

## Appendix A: Quick Reference

### Key Constants

```javascript
STARTING_HEALTH: 10
MAX_HEALTH: 20
MAX_ITEMS_PER_LEVEL: 3
PERFECT_LEVEL_BONUS: 0.5 (50%)
DIFFICULTY_INCREMENT: 0.3
```

### Point Calculation Example

```
Zone 2, Difficulty 2, 50 base points, no items:

Zone Mod = 1.3
Difficulty Mod = 1.3 + 0.3 = 1.6
Combined = 1.6

Final = 50 × 1.6 = 80 points
Currency = 80 × 1.05 (zone bonus) = 84 points
```

### Zone Unlock Chain

```
Zone 1 (free) → 5 levels → Zone 2 → 5 levels → Zone 3 → 5 levels → Zone 4
```

---

## Appendix B: Related Documents

| Document | Purpose |
|----------|---------|
| `STYLE_GUIDE.md` | Visual design specifications |
| `SCREEN_FLOW_DIAGRAM.md` | Navigation and scene flow |
| `ZONE_CREATION_GUIDE.md` | Step-by-step guide for adding new zones |
| `Feature Implementation Plan.md` | Original feature planning |
| `assets-manifest.json` | Asset generation prompts |

---

*This is a living document. Update as features are added or changed.*
