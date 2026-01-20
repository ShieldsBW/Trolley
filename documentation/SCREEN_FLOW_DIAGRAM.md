# Screen Flow Diagram

This document describes the navigation flow between all screens/scenes in The Trolley Problem game.

## Overview

The game consists of 8 main scenes built with Phaser.js:

| Scene | Description |
|-------|-------------|
| LoginScene | User authentication / account creation |
| MainMenuScene | Central hub with navigation to all features |
| WorldMapScene | Zone selection and difficulty settings |
| LevelScene | Core gameplay - trolley dilemmas |
| GameOverScene | End of run - score display and options |
| LeaderboardScene | High scores display |
| ShopScene | Purchase cosmetics and consumables |
| ProfileScene | User stats and achievements |

---

## Flow Diagram (ASCII)

```
                                    +------------------+
                                    |   APPLICATION    |
                                    |      START       |
                                    +--------+---------+
                                             |
                              (check for existing user)
                                             |
                         +-------------------+-------------------+
                         |                                       |
                    (no user)                               (has user)
                         |                                       |
                         v                                       v
                +--------+---------+                   +---------+--------+
                |   LOGIN SCENE    |                   |   MAIN MENU      |
                |                  |   (login/signup)  |     SCENE        |
                |  - Username      +------------------>|                  |
                |  - Login btn     |                   |  - World Map btn |
                |  - Guest btn     |                   |  - Leaderboard   |
                +------------------+                   |  - Shop btn      |
                         ^                             |  - Profile btn   |
                         |                             |  - Logout btn    |
                         |                             |  - Quit btn      |
                    (logout)                           +--------+---------+
                         |                                      |
                         +--------------------------------------+
                                             |
              +------------------------------+------------------------------+
              |              |               |               |              |
              v              v               v               v              v
     +--------+-----+ +------+------+ +-----+------+ +------+-----+ +------+------+
     | WORLD MAP    | | LEADERBOARD | |   SHOP     | |  PROFILE   | |   (Quit)    |
     |    SCENE     | |    SCENE    | |   SCENE    | |   SCENE    | | window.close|
     |              | |             | |            | |            | +-------------+
     | - Zone 1     | | - Top 10    | | - Cosmetics| | - Stats    |
     | - Zone 2     | |   scores    | | - Consumab.| | - Achieve. |
     | - Zone 3     | | - Back btn  | | - Back btn | | - Back btn |
     | - Zone 4     |        |              |              |
     | - Difficulty | +------+------+ +-----+------+ +------+-----+
     | - Back btn   |        |              |              |
     +------+-------+        |              |              |
            |                +-------+------+--------------+
            |                        |
            |                        v
            |               +--------+--------+
            |               |   MAIN MENU     |
            |               |     SCENE       |
            |               +-----------------+
            |
            | (Start Zone / Select Level)
            v
     +------+-------+
     |  LEVEL SCENE |<------------------------------------------+
     |              |                                           |
     | - Question   |                                           |
     | - 2 Choices  |  (Try Again - same zone)                  |
     | - Health bar |                                           |
     | - Points     |                                           |
     | - Menu btn   +--+                                        |
     | - Item bar   |  |                                        |
     +------+-------+  |                                        |
            |          | (Menu button)                          |
            |          v                                        |
            |   +------+------+                                 |
            |   | MAIN MENU   |                                 |
            |   +-------------+                                 |
            |                                                   |
     (health <= 0)                                              |
            |                                                   |
            v                                                   |
     +------+-------+                                           |
     | GAME OVER    |                                           |
     |    SCENE     +-------------------------------------------+
     |              |
     | - Total Pts  |  (World Map button)     +-----------------+
     | - World Map  +------------------------>| WORLD MAP SCENE |
     | - Try Again  |                         +-----------------+
     | - Submit Scr |
     | - Menu btn   |  (Submit Score)         +-----------------+
     +------+-------+------------------------>| LEADERBOARD     |
            |                                 +-----------------+
            |
            | (Menu button)
            v
     +------+------+
     | MAIN MENU   |
     +-------------+
```

---

## Detailed Scene Descriptions

### 1. LoginScene
**Entry Points:**
- Application start (if no existing user)
- Logout from MainMenuScene

**Exit Points:**
- MainMenuScene (after successful login or guest signup)

**Key Elements:**
- Username input field
- Login button
- Play as Guest button

---

### 2. MainMenuScene
**Entry Points:**
- LoginScene (after login)
- LevelScene (Menu button)
- GameOverScene (Menu button)
- LeaderboardScene (Back button)
- WorldMapScene (Back button)
- ShopScene (Back button)
- ProfileScene (Back button)

**Exit Points:**
- WorldMapScene (World Map button)
- LeaderboardScene (Leaderboard button)
- ShopScene (Shop button)
- ProfileScene (Profile button)
- LoginScene (Logout button)
- Close window (Quit button)

**Key Elements:**
- Game logo
- Welcome message with username
- Points display
- Navigation buttons (World Map, Leaderboard, Shop, Profile)
- Logout button
- Quit button

---

### 3. WorldMapScene
**Entry Points:**
- MainMenuScene (World Map button)
- GameOverScene (World Map button)

**Exit Points:**
- LevelScene (Start zone/level)
- MainMenuScene (Back button)

**Key Elements:**
- Zone markers (Zone 1, 2, 3, 4)
- Zone detail panel with:
  - Zone name and description
  - Progress indicator (X/5 levels)
  - Difficulty selector (1, 2, 3)
  - Start button
- Back button

---

### 4. LevelScene
**Entry Points:**
- WorldMapScene (Start zone)
- GameOverScene (Try Again button)
- Self (next level progression)

**Exit Points:**
- GameOverScene (health reaches 0)
- MainMenuScene (Menu button)
- Self (level complete -> next level)
- Zone Complete popup -> next zone or MainMenuScene

**Key Elements:**
- Zone-specific background
- Question frame with dilemma text
- Two choice buttons (Left/Right track)
- Health bar (top-left)
- Points display (top-left)
- Level indicator (top-right)
- Menu button (bottom-right)
- Item bar (left side, vertical layout) - shows owned consumables during gameplay
- Zone Progress Tracker (bottom center) - animated SVG trolley path visualization
- Consequence popup (after choice)
- Level Complete overlay (after completing all stages)

**Gameplay Flow:**
```
Start Level
    |
    v
Show Question + Choices
    |
    v
Player Makes Choice
    |
    v
Show Consequence Popup
(points gained/lost, HP change)
    |
    v
[Stage < 3?] --Yes--> Next Stage (loop back)
    |
    No
    v
Level Complete
    |
    v
[Level < 5?] --Yes--> Next Level
    |
    No
    v
Zone Complete Popup
    |
    v
[More Zones?] --Yes--> Start Next Zone
    |
    No
    v
All Zones Complete -> MainMenuScene
```

---

### 5. GameOverScene
**Entry Points:**
- LevelScene (health reaches 0)

**Exit Points:**
- WorldMapScene (World Map button)
- LevelScene (Try Again button)
- LeaderboardScene (Submit Score button)
- MainMenuScene (Menu button)

**Key Elements:**
- Game Over title image
- Total points display
- Button container:
  1. World Map button
  2. Try Again button
  3. Submit Score button
  4. Menu button

---

### 6. LeaderboardScene
**Entry Points:**
- MainMenuScene (Leaderboard button)
- GameOverScene (Submit Score button)

**Exit Points:**
- MainMenuScene (Back button)

**Key Elements:**
- Leaderboard frame
- Top 10 scores (initials + score)
- Back button

---

### 7. ShopScene
**Entry Points:**
- MainMenuScene (Shop button)

**Exit Points:**
- MainMenuScene (Back button)

**Key Elements:**
- Shop frame
- Tab buttons (Cosmetics / Consumables)
- Item grid (3 per row, paginated)
- Pagination arrows (< Page X / Y >)
- Item cards with:
  - Image
  - Name
  - Price
  - Buy/Owned/Equipped button
- Back button

---

### 8. ProfileScene
**Entry Points:**
- MainMenuScene (Profile button)

**Exit Points:**
- MainMenuScene (Back button)
- LoginScene (if no user found)

**Key Elements:**
- Profile frame
- User info (username, account type, join date)
- Stats grid:
  - Points (currency)
  - Games Played
  - Total Points earned
  - Choices Made
  - Levels Completed
  - Achievements count
- Achievements section
- Back button

---

## Data Flow

### Points System
```
Gameplay Choice
      |
      v
Points calculated (base * difficulty * multipliers)
      |
      v
Added to user.inventory.currency (persistent)
      |
      v
Displayed in HUD and on Game Over
      |
      v
Used in Shop for purchases
```

### Progress Tracking
```
Level Complete
      |
      v
Record in user.progress.completedLevels
      |
      v
Zone Complete (5 levels)
      |
      v
Record in user.progress.zoneCompletions[zoneId]
      |
      v
Unlock next difficulty tier
```

---

## Debug Mode

Debug controls are located in the bottom-left corner of the game screen:
- **Magnifying glass button**: Hold to show debug outlines
- **Unlock button**: Unlocks all zones (when visible)

Hold the magnifying glass button to show debug outlines:
- **Red**: Frame elements
- **Lime/Green**: Safe areas, Game Over elements
- **Cyan**: Buttons
- **Yellow**: Text elements
- **Magenta**: Containers
- **Orange**: Logos
- **Gold**: Zone elements
- **Violet**: Shop/Profile elements

---

*Document updated: January 19, 2026 (v1.1)*
