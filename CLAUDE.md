# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Бронепехота (Bronepehota) is a Next.js 14 web application for a tabletop wargame. The app allows players to build armies, manage game sessions, and edit game data (squads, machines, factions). All UI text is in Russian; code uses English conventions.

## Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)

# Building
npm run build        # Production build
npm run start        # Run production server

# Code Quality
npm run lint         # Run ESLint

# Testing
npm run test         # Run all Jest tests
npm run test:watch   # Run tests in watch mode
```

## Architecture

### Data Layer

**File-based JSON storage** in `src/data/`:
- `factions.json` - Faction definitions (3 factions)
- `squads.json` - Squad/army list data
- `machines.json` - Vehicle/machine data

**API Routes** (`src/app/api/armlists/`):
- `factions/route.ts` - GET/POST/DELETE factions
- `squads/route.ts` - GET/POST/DELETE squads
- `machines/route.ts` - GET/POST/DELETE machines
- `upload-image/route.ts` - POST image uploads to `public/images/`

All API routes use synchronous `readFileSync`/`writeFileSync` operations. The POST handler handles both create (new ID) and update (existing ID) operations.

### State Management

**Client-side persistence**: Army state is saved to `localStorage` under key `bronepehota_army`. The main page (`src/app/page.tsx`) manages the `Army` state and passes it down to child components.

**Runtime vs Template Data**:
- Template data (Squad, Machine) = immutable definitions from JSON
- Runtime data (ArmyUnit) = instances with current state (durability, ammo, deadSoldiers, actionsUsed)

### Core Types (`src/lib/types.ts`)

```typescript
FactionID = 'polaris' | 'protectorate' | 'mercenaries'

Soldier      // Individual soldier stats (rank, speed, range, power, melee, props, armor)
Squad        // Collection of 1-6 soldiers
Machine      // Vehicle with weapons, speed_sectors, durability, ammo
ArmyUnit     // Runtime instance of Squad or Machine with game state
Army         // Player's army with units, totalCost, faction
```

**Adding a new faction**: Update `FactionID` type in `types.ts` and add entry to `factions.json`.

### Game Logic (`src/lib/game-logic.ts`)

Dice notation parsing: `D6`, `D12+2`, `2D12`, `ББ` (melee)
- `parseRoll(rollStr)` → `{ dice, sides, bonus }`
- `executeRoll(rollStr)` → `{ total, rolls[] }`
- `calculateHit(rangeStr, distanceSteps)` → hit check
- `calculateDamage(powerStr, targetArmor)` → damage count
- `calculateMelee(attackerMelee, defenderMelee)` → combat resolution

### Component Structure

**Main Page** (`src/app/page.tsx`):
- Header with faction branding, view toggle (Штаб/В Бой), editor link
- ArmyBuilder (construction) OR GameSession (gameplay)
- Footer with army stats

**Key Components**:
- `ArmyBuilder.tsx` - Filter/search units, add to army, export/import JSON
- `GameSession.tsx` - Two tabs: "Войска" (units) and "Атака" (combat)
- `UnitCard.tsx` - Individual unit display, combat modal, animated dice
- `ArmlistEditor.tsx` - Create/edit squads and machines with nested sub-editors
- `CombatAssistant.tsx` - Standalone combat calculator

### Editor Pattern

The editor uses nested components:
- `ArmlistEditor` → toggle between Squad/Machine mode
- `SquadEditor` → `SoldierEditor[]` (up to 6 soldiers)
- `MachineEditor` → speed sectors + weapons

**ID Generation**: `{faction}_{slugified_name}` (e.g., `polaris_light_assault_clone`)

**Image Upload**: Three methods - file picker, drag-drop, clipboard paste (Ctrl+V). Images saved to `public/images/squads/` or `public/images/machines/`.

### Styling

- **Tailwind CSS** with dark theme (slate-900 base)
- **Faction colors**: Polaris (red #ef4444), Protectorate (blue #3b82f6), Mercenaries (yellow #eab308)
- **Responsive**: Mobile-first, hide labels on mobile (`hidden md:inline`)
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`)

### Testing

Jest with jsdom environment. Tests focus on game logic utilities (`game-logic.ts`). Test files go in `src/__tests__/`.

## Important Notes

1. **All API error messages must be in Russian** (e.g., `Ошибка чтения данных`)
2. **Dice notation**: "D6", "D12", "D20" for range; "1D6", "2D12" for power; "ББ" for melee
3. **Speed sectors** must cover full range from 1 to `durability_max` without gaps
4. **Props** are string arrays: `["Г"]` for grenade, `[]` for none
5. **Images**: Max 10MB, saved with timestamp + random suffix for uniqueness

## Active Technologies
- TypeScript 5.x (via Next.js 14) + React 18, Next.js 14, Tailwind CSS, Lucide React (001-army-building-flow)
- JSON files in `src/data/` (factions.json, squads.json) + localStorage for army state (001-army-building-flow)
- JSON files in `src/data/` (factions.json, squads.json, machines.json) + localStorage for army state (001-show-unit-details)
- TypeScript 5.x (via Next.js 14) + React 18 + Next.js 14, React 18, Tailwind CSS, Lucide React (001-unit-numbering)
- JSON files in `src/data/` (factions.json, squads.json, machines.json) + localStorage for army state (`bronepehota_army`) (001-unit-numbering)
- TypeScript 5.x (via Next.js 14.2.35, React 18) + React 18, Next.js 14, Tailwind CSS, Lucide React, clsx, tailwind-merge (002-rules-version-selection)
- localStorage for rules version persistence (key: `bronepehota_rules_version`), JSON files for game data in `src/data/` (002-rules-version-selection)
- JSON files in `src/data/` (factions.json, squads.json, machines.json) + localStorage for rules version (`bronepehota_rules_version`) (003-official-rules)
- TypeScript 5.x (via Next.js 14.2.35), React 18 + Next.js 14, React 18, Tailwind CSS, Lucide React (001-rules-selector)
- localStorage (`bronepehota_rules_version`), JSON files in `src/data/` (extended RulesVersion in code) (001-rules-selector)

## Recent Changes
- 001-army-building-flow: Added TypeScript 5.x (via Next.js 14) + React 18, Next.js 14, Tailwind CSS, Lucide React
