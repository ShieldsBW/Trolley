# Trolley Problem Game - Feature Implementation Plan

## Overview

This plan covers implementation of 5 major features for the Trolley Problem browser game:
1. **User Login/Account System** - Create account, save progress
2. **World Map Scene** - Level/zone selection with difficulty options
3. **Shop System** - Cosmetics and consumables
4. **Zone Progression** - Different backgrounds, scaling difficulty, 5-choice rounds
5. **Social Features** - Profile/stats foundation

## New Scene Flow

```
LoginScene (NEW)
     │
     ▼
MainMenuScene (enhanced with Shop, World Map, Profile buttons)
     │
     ├──▶ WorldMapScene (NEW) ──▶ LevelScene ──▶ GameOverScene
     │                                              │
     ├──▶ ShopScene (NEW)                          │
     │                                              │
     ├──▶ ProfileScene (NEW)                       │
     │                                              │
     └──▶ LeaderboardScene ◀────────────────────────┘
```

## Files to Modify

| File | Changes |
|------|---------|
| `trolley_game.html` | Add 4 new scenes, data structures, helper functions, DOM elements |

## New Assets Required

**Backgrounds:**
- `login_bg.png` - Login screen
- `worldmap_bg.png` - World map with zone indicators
- `shop_bg.png` - Shop interior
- `profile_bg.png` - Player profile
- `level_02_background.png`, `level_03_background.png` - Additional zones

**Buttons:**
- `button_login.png`, `button_createAccount.png`
- `button_worldMap.png`, `button_shop.png`, `button_profile.png`
- `button_back.png`, `button_buy.png`, `button_equip.png`
- `button_useItem.png`

**Zone/Shop UI:**
- Zone icons (unlocked/locked/complete states)
- Item preview images
- Currency icon

---

## Phase 1: User Account System (Foundation)

**Why first:** All other features depend on persistent user data.

### Data Structure
```javascript
// localStorage key: 'trolley_user'
{
  userId: "user_123456789_abc",
  username: "PlayerName",
  createdAt: 1700000000000,
  lastLogin: 1700000000000,
  version: 1,  // For migration support
  progress: {
    currentZone: 1,
    completedLevels: [],
    highScores: {}
  },
  stats: {
    totalGames: 0,
    totalPoints: 0,
    totalDeaths: 0,
    choicesMade: 0,
    perfectLevels: 0
  },
  inventory: {
    currency: 0,
    cosmetics: ["trolley_default"],
    consumables: {}
  },
  equipped: {
    trolleyAppearance: "trolley_default"
  }
}
```

### Implementation Steps
1. Add helper functions: `getUser()`, `saveUser()`, `createUser()`
2. Create `LoginScene` class with username input
3. Add "Continue as Guest" option (Guest_XXXX username)
4. Update `MainMenuScene` to show welcome message + currency
5. Update `GameOverScene` to save stats and award currency

---

## Phase 2: Zone Progression System

### Zone Configuration
```javascript
const ZoneConfig = [
  { id: 1, name: "Starter Rails", choicesPerLevel: 3, difficultyMod: 1.0, background: "level_01_background.png" },
  { id: 2, name: "Industrial District", choicesPerLevel: 4, difficultyMod: 1.3, background: "level_02_background.png" },
  { id: 3, name: "City Center", choicesPerLevel: 5, difficultyMod: 1.6, background: "level_03_background.png" }
];
```

### Implementation Steps
1. Add `ZoneConfig` constant
2. Modify `LevelScene` to read zone from registry
3. Load zone-specific background dynamically
4. Scale choices (3→4→5) and difficulty per zone
5. Expand junction pool with zone-themed prompts
6. Track zone completion in user progress

---

## Phase 3: World Map Scene

### Implementation Steps
1. Create `WorldMapScene` class
2. Add DOM elements (background, zone icons, info panel)
3. Display locked/unlocked zones based on user progress
4. Show completion progress per zone (e.g., "3/5 levels")
5. Wire zone selection to start `LevelScene` with correct zone

### Unlock Requirement
- Complete 4 of 5 levels in previous zone to unlock next

---

## Phase 4: Shop System

### Item Categories
**Cosmetics (one-time purchase):**
- Trolley skins (gold, fire, etc.)

**Consumables (stackable):**
- HP Restore Small (+3 HP) - 100 currency
- HP Restore Large (+7 HP) - 250 currency
- Point Booster (2x points for level) - 200 currency

### Implementation Steps
1. Create `ShopScene` with tab navigation (Cosmetics/Consumables)
2. Display item grid with owned vs purchasable
3. Implement purchase flow with currency deduction
4. Add equipment system for cosmetics
5. Add item bar to `LevelScene` for consumable use
6. Currency earning: 10% of score + zone bonus + perfect level bonus

---

## Phase 5: Social Features (Foundation)

### Implementation Steps
1. Create `ProfileScene` showing user stats
2. Add achievement system (local badges)
3. Prepare data structures for future backend sync

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| File structure | Keep single HTML file (maintains file:// compatibility) |
| Art assets | **AI-generated** - Create matching assets using AI tools |
| Guest mode | **Allow** with "Guest_" prefix, prompt for full account later |
| Backend prep | **Plan for sync** - Data structures designed for future server integration |
| Zone unlock | 4 of 5 levels required |
| Currency rate | 10% of score, +5% per zone, +50% for perfect level |
| Item limits | Max 3 consumables usable per level run |

### Backend-Ready Data Design
All user data will include:
- UUIDs for user identification
- Timestamps on all records for sync conflict resolution
- Version numbers on data structures for migration support
- API-friendly function signatures (async-ready)

---

## Implementation Order

```
Phase 1 (User Account) ──┬──▶ Phase 2 (Zones) ──▶ Phase 3 (World Map)
                         │
                         ├──▶ Phase 4 (Shop)
                         │
                         └──▶ Phase 5 (Social)
```

**Dependency explanation:**
- Phase 1 must be first - all features depend on user data persistence
- Phase 2 before Phase 3 - zones must exist before world map can display them
- Phase 4 & 5 can proceed in parallel after Phase 1

---

## Verification Plan

After each phase:
1. Open `trolley_game.html` directly in browser (file:// protocol)
2. Test scene transitions and data persistence
3. Clear localStorage and verify fresh start works
4. Test edge cases (no user, corrupted data, max items)

**Phase 1 verification:**
- Create account → data persists on refresh
- Guest mode → generates unique ID
- Game over → stats updated, currency awarded

**Phase 3 verification:**
- Locked zones show lock indicator
- Zone selection starts correct background
- Progress saves on level complete

**Phase 4 verification:**
- Purchase deducts currency
- Owned items marked correctly
- Consumables usable in-game

---

## Asset Requirements Summary

### New Backgrounds Needed
| Asset | Purpose | Style Reference |
|-------|---------|-----------------|
| `login_bg.png` | Login/account screen | Match menu_bg.png aesthetic |
| `worldmap_bg.png` | Zone selection map | Stylized map with railroad tracks |
| `shop_bg.png` | Shop interior | Indoor marketplace feel |
| `profile_bg.png` | Player stats screen | Similar to leaderboard_bg.png |
| `level_02_background.png` | Zone 2 gameplay | Industrial/urban theme |
| `level_03_background.png` | Zone 3 gameplay | City center theme |

### New Buttons Needed
| Asset | Purpose |
|-------|---------|
| `button_login.png` | Submit login |
| `button_createAccount.png` | Create new account |
| `button_guest.png` | Play as guest |
| `button_worldMap.png` | Navigate to world map |
| `button_shop.png` | Navigate to shop |
| `button_profile.png` | Navigate to profile |
| `button_back.png` | Return to previous screen |
| `button_buy.png` | Purchase item |
| `button_equip.png` | Equip cosmetic |
| `button_useItem.png` | Use consumable in-game |

### UI Elements Needed
| Asset | Purpose |
|-------|---------|
| `zone_1_icon.png` | Zone 1 selector |
| `zone_2_icon.png` | Zone 2 selector |
| `zone_3_icon.png` | Zone 3 selector |
| `lock_overlay.png` | Locked zone indicator |
| `currency_icon.png` | Currency display |
| `item_hp_small.png` | Small HP potion icon |
| `item_hp_large.png` | Large HP potion icon |
| `item_point_boost.png` | Point booster icon |
