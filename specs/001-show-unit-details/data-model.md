# Data Model: Show Unit Details in Army Builder

**Feature**: 001-show-unit-details
**Date**: 2025-01-04

## Overview

This feature is purely UI-focused and does not introduce any new data entities. All data structures already exist in the codebase (`src/lib/types.ts`). This document describes how existing entities are used in the modal display.

## Existing Entities Used

### Soldier

**Source**: `src/lib/types.ts`

**Fields Used in Modal**:
- `rank: number` - Rank value displayed with label "Ранг"
- `speed: number` - Speed value displayed with label "Скорость"
- `range: string` - Dice notation (e.g., "D6", "D12+2") displayed with label "Дальность"
- `power: string` - Dice notation (e.g., "1D6", "2D12") displayed with label "Мощь"
- `melee: number` - Melee value displayed with label "Бой"
- `armor: number` - Armor value displayed with label "Защита"
- `props: string[]` - Special properties array (e.g., ["Г"] for grenade) displayed as badges
- `image?: string` - Optional soldier image URL

**Display Format**:
- Grid layout with icon + label + value for each stat
- Props displayed as separate badges with visual highlighting
- Image displayed if present

### Squad

**Source**: `src/lib/types.ts`

**Fields Used in Modal**:
- `name: string` - Squad name (modal title)
- `faction: FactionID` - Faction for color styling
- `cost: number` - Point cost displayed prominently
- `soldiers: Soldier[]` - Array of soldiers to display
- `image?: string` - Optional squad image URL (modal header)

**Display Format**:
- Modal title shows squad name
- Faction color used for border/accent styling
- Cost displayed below title
- Soldiers rendered as list with details

### Machine

**Source**: `src/lib/types.ts`

**Fields Used in Modal**:
- `name: string` - Machine name (modal title)
- `faction: FactionID` - Faction for color styling
- `cost: number` - Point cost displayed prominently
- `rank: number` - Rank displayed with label "Ранг"
- `fire_rate: number` - Fire rate displayed with label "Скорострельность"
- `ammo_max: number` - Max ammo displayed with label "Боезапас"
- `durability_max: number` - Max durability displayed with label "Прочность"
- `speed_sectors: SpeedSector[]` - Array of speed ranges
- `weapons: Weapon[]` - Array of weapons
- `image?: string` - Optional machine image URL (modal header)

**Display Format**:
- Modal title shows machine name
- Faction color used for border/accent styling
- Cost displayed below title
- Basic stats (rank, fire_rate, ammo_max, durability_max) in grid
- Speed sectors displayed as table/range list
- Weapons rendered as list with details

### Weapon

**Source**: `src/lib/types.ts`

**Fields Used in Modal**:
- `name: string` - Weapon name (subheading)
- `range: string` - Dice notation displayed with label "Дальность"
- `power: string` - Dice notation displayed with label "Мощь"
- `special?: string` - Optional special rules text

**Display Format**:
- Weapon name as subheading
- Range and power in grid format
- Special rules displayed in italic text if present

### SpeedSector

**Source**: `src/lib/types.ts`

**Fields Used in Modal**:
- `min_durability: number` - Minimum durability value
- `max_durability: number` - Maximum durability value
- `speed: number` - Speed value for this range

**Display Format**:
- Table format with columns: Range, Speed
- Range displayed as "min-max" durability
- Speed displayed as numeric value

## State Management

### Modal State (New)

**Component**: `UnitDetailsModal.tsx`

**State**:
```typescript
interface UnitDetailsModalProps {
  unit: Squad | Machine;      // The unit to display
  isOpen: boolean;             // Controlled by parent
  onClose: () => void;         // Callback to close
}

// Internal state (if needed for animations)
const [isAnimating, setIsAnimating] = useState(false);
```

**Parent Component Changes**:
- `ArmyBuilder.tsx`: Add state for selected unit and modal visibility
- `UnitSelector.tsx`: Add click handlers to unit cards

## Data Flow

```
User clicks unit card
    ↓
Parent component sets selectedUnit + modalOpen = true
    ↓
UnitDetailsModal renders with unit data
    ↓
User reads stats, clicks close/backdrop
    ↓
Parent component sets modalOpen = false
```

## Validation Rules

No new validation needed. All data is read-only display of existing validated data structures.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty soldiers array | Display empty state message "Нет данных о солдатах" |
| Empty weapons array | Display empty state message "Нет вооружения" |
| Empty speed_sectors array | Display empty state message "Нет данных о скорости" |
| Missing image | Display without image, no placeholder needed |
| Invalid dice notation | Display as-is, let game logic handle validation |
| Very long weapon name | Truncate with ellipsis, show full on hover (desktop) |
| Negative stat values | Display with red color, indicate error |

## Component Interface

### UnitDetailsModal Props

```typescript
interface UnitDetailsModalProps {
  unit: Squad | Machine;
  unitType: 'squad' | 'machine';
  faction: Faction;
  isOpen: boolean;
  onClose: () => void;
}
```

### Parent State Management

```typescript
// In ArmyBuilder.tsx or UnitSelector.tsx
const [selectedUnit, setSelectedUnit] = useState<Squad | Machine | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleUnitClick = (unit: Squad | Machine, type: 'squad' | 'machine') => {
  setSelectedUnit(unit);
  setIsModalOpen(true);
};

const handleModalClose = () => {
  setIsModalOpen(false);
  // Keep selectedUnit for animation, clear after
};
```

## Summary

This feature introduces no new data entities. It uses existing `Soldier`, `Squad`, `Machine`, `Weapon`, and `SpeedSector` types from `src/lib/types.ts`. The only new state is modal UI state (open/close, selected unit).
