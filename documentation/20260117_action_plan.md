# Action Plan - January 17, 2026

Based on playtest feedback from `20260117_playtest_notes.txt`

---

## Summary

9 feedback items organized into 3 phases:
- **Phase A**: Quick UI/CSS fixes (no new assets)
- **Phase B**: Asset generation needed
- **Phase C**: Larger feature changes

---

## Phase A: Quick UI/CSS Fixes

### A1. Darken Shop/Profile overlay backgrounds (Feedback #1)
- **File**: `trolley_game.html`
- **Change**: Increase opacity of `background:rgba(0,0,0,0.3)` to `rgba(0,0,0,0.6)` or similar for better readability
- **Locations**: `#shop-items`, `#profile-content`, `#achievements-content`
- **Effort**: 5 min

### A2. Shop layout spacing (Feedback #2)
- **File**: `trolley_game.html`
- **Changes**:
  - Add margin below "SHOP" title before tabs
  - Visually attach tabs to the frame below (remove gap, adjust border-radius)
- **Effort**: 10 min

### A3. Profile achievements panel positioning (Feedback #3)
- **File**: `trolley_game.html`
- **Change**: Move `#achievements-content` down to avoid overlap with `#profile-content`
- **Current**: `top:420px` - may need to increase or make dynamic
- **Effort**: 5 min

### A4. Currency tooltip (Feedback #5)
- **File**: `trolley_game.html`
- **Change**: Add `title="Currency"` attribute to currency icon images
- **Locations**: Main menu currency display, shop currency display
- **Effort**: 5 min

### A5. Game Over "World Map" button (Feedback #8)
- **File**: `trolley_game.html`
- **Change**: Add new button between "Try Again" and "Menu" that returns to WorldMapScene
- **Note**: Can reuse existing button styling initially, generate art in Phase B
- **Effort**: 15 min

---

## Phase B: Asset Generation Required

### B1. Main Menu layout overhaul (Feedback #4)
**UI Changes needed:**
- Move Welcome text to right of title logo, increase size 2x
- Shop + Profile buttons on same line as Leaderboard, 60% size of Start Game
- Move Start Game below that line, centered with spacing
- Logout button at bottom (like Quit)

**New assets needed:**
- `button_worldMap.png` - Replace "Start Game" text with "World Map" (similar style)
- `button_logout.png` - Gray background, brass frame, "LOGOUT" text

**Effort**: 30 min code + asset generation

### B2. World Map redesign (Feedback #6)
**UI Changes needed:**
- Smaller zone icons on the map (clickable markers)
- Right-side panel for zone details (appears on click)
- Panel shows zone info, progress, difficulty
- "Start Game" button in panel to begin round
- Ability to click different zones to update panel

**New assets needed:**
- Zone marker icons (small, for map placement)
- Zone detail panel frame
- Reuse existing `button_startGame.png` in the panel

**Effort**: 1-2 hours (significant rework)

### B3. In-game question/choice frames (Feedback #7)
**New assets needed:**
- `frame_question.png` - Decorative frame for the question/prompt text
- `frame_choice.png` - Frame for each choice option

**UI Changes:**
- Add padding inside frames for text breathing room
- Style question text to be more prominent

**Effort**: 30 min code + asset generation

### B4. Generate button_logout.png (Feedback #9)
**Prompt spec:**
- Same Victorian brass frame style as other buttons
- Gray/silver background panel instead of green/brown
- Text: "LOGOUT"

**Effort**: Asset generation (~$0.08)

### B5. Generate button for Game Over "World Map" (Feedback #8)
**Prompt spec:**
- Same style as "Try Again" button
- Text: "WORLD MAP"

**Effort**: Asset generation (~$0.08)

---

## Phase C: Dependencies & Considerations

### Asset Generation Budget Estimate
| Asset | Est. Cost |
|-------|-----------|
| button_logout.png | $0.08 |
| button_worldMap_gameover.png | $0.08 |
| frame_question.png | $0.08 |
| frame_choice.png | $0.08 |
| Zone marker icons (3) | $0.24 |
| Zone detail panel frame | $0.08 |
| **Total** | **~$0.64** |

### Recommended Order of Implementation

1. **Phase A (all)** - Quick wins, immediate visual improvement
2. **B1** - Main menu layout (high visibility)
3. **B4 + B5** - Generate logout and world map buttons
4. **B3** - Question/choice frames (improves core gameplay)
5. **B2** - World map redesign (largest change, do last)

---

## Pre-Implementation Checklist

- [ ] Confirm budget for asset generation (~$0.64 needed)
- [ ] Review current button dimensions for sizing reference
- [ ] Back up current `trolley_game.html` before major changes
- [ ] Test each phase before moving to next

---

## Questions for Clarification

1. **B2 (World Map)**: Should zone markers show lock/unlock state visually on the map itself?
2. **B1 (Main Menu)**: Exact positioning preferences for the new layout? (mockup helpful)
3. **B3 (Frames)**: Preferred frame style - ornate Victorian or simpler brass border?

---

*Ready to begin implementation on your command.*
