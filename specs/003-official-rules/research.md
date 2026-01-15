# Research: Official Rules Combat Calculation

**Feature**: 003-official-rules
**Date**: 2026-01-14
**Status**: Complete

## Overview

This document summarizes research findings for implementing accurate combat calculations for both official rules (Технолог) and fan rules (Панов) editions of the Бронепехота wargame.

## Research Tasks

### 1. Fortification Modifiers

**Question**: How to model fortification types (none, light, bunker, heavy) and their different effects in each rules edition?

**Findings**:

**Official Rules (tehnolog)** - Fortifications affect target armor:
- No cover: +0 to armor
- Light cover (окопы): +1 to armor
- Bunker: +2 to armor
- Heavy bunker (бункер+): +3 to armor

Source: `docs/original/official_rules.txt` Section 7 (Виртуальная стрельба)

**Fan Rules (panov)** - Fortifications affect attack distance:
- No cover: +0 to distance
- Light cover: +1 to distance
- Full cover (bunker): +2 to distance

Source: `docs/panov/fan_rules.txt` Section 7

**Decision**: Create a `FortificationType` enum with 4 values. Each rules edition applies modifiers differently:
- Official: adds to effective armor before damage calculation
- Fan: adds to effective distance before hit calculation

**Type Definition**:
```typescript
export type FortificationType = 'none' | 'light' | 'bunker' | 'heavy';

export interface FortificationModifiers {
  armor: number;  // For official rules
  distance: number; // For fan rules
}

export const FORTIFICATION_MODIFIERS: Record<FortificationType, FortificationModifiers> = {
  none: { armor: 0, distance: 0 },
  light: { armor: 1, distance: 1 },
  bunker: { armor: 2, distance: 2 },
  heavy: { armor: 3, distance: 2 } // Note: fan rules don't have heavy, use bunker value
};
```

---

### 2. Durability Zones

**Question**: How to model vehicle durability zones (green/yellow/red) for fan rules damage calculation?

**Findings**:

From `docs/panov/fan_rules.txt` page 27:
- Vehicle durability is divided into 3 color-coded zones
- Green zone: high durability (top third of scale)
- Yellow zone: medium durability (middle third)
- Red zone: low durability (bottom third)
- When attacking a vehicle, compare the die roll to the MAXIMUM value of the current zone
- If die > zone max: armor penetrated, deal damage based on die type (D6=1, D12=2, D20=3)

**Existing Data**: Vehicle speed_sectors already define durability ranges:
```typescript
export interface SpeedSector {
  min_durability: number;
  max_durability: number;
  speed: number;
}
```

**Decision**: Map speed_sectors to durability zones by position:
- Zone 0 (highest durability range): Green zone
- Zone 1 (middle durability range): Yellow zone
- Zone 2 (lowest durability range): Red zone

Add optional `durabilityZones` array to Machine interface for explicit zone definitions:

```typescript
export interface DurabilityZone {
  max: number;      // Maximum value for this zone
  color: 'green' | 'yellow' | 'red';
  damagePerDie: {   // Damage dealt on penetration
    D6: number;
    D12: number;
    D20: number;
  };
}

// Add to Machine interface
export interface Machine {
  // ... existing fields
  durabilityZones?: DurabilityZone[]; // Optional, defaults to 3 zones from speed_sectors
}
```

**Zone Calculation Logic**:
```typescript
function getDurabilityZone(machine: Machine, currentDurability: number): DurabilityZone {
  if (machine.durabilityZones) {
    // Use explicit zones if provided
    return machine.durabilityZones.find(zone => currentDurability <= zone.max)
      || machine.durabilityZones[machine.durabilityZones.length - 1];
  }
  // Default: derive from speed_sectors (3 zones)
  const zones: DurabilityZone[] = [
    { max: machine.speed_sectors[0]?.max_durability || machine.durability_max,
      color: 'green', damagePerDie: { D6: 1, D12: 2, D20: 3 } },
    { max: machine.speed_sectors[1]?.max_durability || Math.floor(machine.durability_max * 2/3),
      color: 'yellow', damagePerDie: { D6: 1, D12: 2, D20: 3 } },
    { max: machine.speed_sectors[2]?.max_durability || Math.floor(machine.durability_max / 3),
      color: 'red', damagePerDie: { D6: 1, D12: 2, D20: 3 } }
  ];
  return zones.find(zone => currentDurability <= zone.max) || zones[2];
}
```

---

### 3. UI Pattern for Fortification Selection

**Question**: Best practice for mobile-friendly selection UI in combat modal?

**Findings**:

Research of mobile UI patterns for selection:

**Option 1: Radio Buttons (Chips)**
- Visual: Horizontal row of pill-shaped buttons
- Active state: Filled background with faction color
- Touch target: 44px minimum height
- Works well for 2-4 options
- Example: Tailwind `rounded-full px-4 py-2`

**Option 2: Segmented Control**
- Visual: Single container with dividers between options
- Active state: Highlighted segment
- Compact form factor
- More native feel on iOS

**Option 3: Dropdown**
- Most compact
- Requires 2 taps to change (open, select)
- Less discoverable
- Not ideal for frequently-changed setting

**Decision**: Use **Option 1 (Chips/Radio Buttons)** for the following reasons:
- All options visible at once (better for quick reference)
- Single tap to change (better for rapid gameplay)
- Visual feedback matches existing design system
- Fits mobile constraints with horizontal scrolling if needed

**Component Structure**:
```typescript
interface FortificationSelectorProps {
  value: FortificationType;
  onChange: (type: FortificationType) => void;
  rulesVersion: RulesVersionID;
}

// Visual layout:
// [ Без укрытия ] [ Лёгкое ] [ Бункер ] [ Бункер+ ]
//   44px height, 8px gap, scrollable if needed
```

**Tailwind Classes**:
```tsx
<div className="flex gap-2 overflow-x-auto pb-2">
  {options.map(opt => (
    <button
      className={clsx(
        "flex-shrink-0 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200",
        isSelected
          ? factionColorClasses // Faction-colored background
          : "bg-slate-700 text-slate-300"
      )}
    >
      {opt.label}
    </button>
  ))}
</div>
```

---

### 4. Information Modal Content

**Question**: How much detail to show about rules mechanics without cluttering the interface?

**Findings**:

From spec clarification Q&A (2025-01-14):
- "Краткое описание механики расчёта (таблица попадания/виртуальная стрельба)"
- "Не должно загромождать основной интерфейс"
- Triggered by info icon button in combat modal

**Content Structure**:

1. **Header**: Rules edition name with source reference
2. **Hit Calculation**: Brief description with formula
3. **Damage Calculation**: Brief description with formula
4. **Fortifications**: Table of modifiers
5. **Special Notes**: Any edition-specific rules

**Official Rules Content**:
```
Официальные правила (Технолог)

Попадание: Бросок кубика дальности >= расстоянию до цели
Урон по пехоте: Каждый кубик > брони цели = 1 ранение
Урон по технике: Каждый кубик > брони = 1 повреждение

Укрепления:
  Без укрытия: +0 к броне
  Лёгкое (окопы): +1 к броне
  Бункер: +2 к брони
  Бункер+: +3 к брони

Источник: docs/original/official_rules.txt, раздел 7
```

**Fan Rules Content**:
```
Фанатские правила (Панов)

Попадание: Бросок кубика дальности >= расстоянию до цели
Урон по пехоте: Каждый кубик > брони цели = 1 ранение
Урон по технике: Сравнение с зоной прочности
  D6 = 1 урон при пробитии
  D12 = 2 урона при пробитии
  D20 = 3 урона при пробитии

Укрепления:
  Без укрытия: +0 к дистанции
  Лёгкое укрытие: +1 к дистанции
  Полное укрытие (бункер): +2 к дистанции

Источник: docs/panov/fan_rules.txt, раздел 7
```

**Component Structure**:
```typescript
interface RulesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesVersion: RulesVersionID;
}

// Uses existing Modal component pattern
// Icon: Info icon from lucide-react
// Placement: Top-right of combat modal
```

**Visual Design**:
- Glass-strong background (90% opacity, 20px blur)
- 16px border radius
- Max width: 600px (desktop), calc(100vw - 32px) (mobile)
- Close button with X icon
- Markdown-formatted content for easy formatting

---

## Summary of Decisions

| Research Question | Decision | Rationale |
|------------------|----------|-----------|
| Fortification Modifiers | Enum with 4 types, edition-specific modifier application | Matches both rules editions, type-safe |
| Durability Zones | Optional explicit zones, fallback to speed_sectors mapping | Backward compatible, flexible |
| Fortification UI | Horizontal chip buttons (radio style) | Single-tap, all options visible |
| Info Modal Content | Brief formulas + modifier tables | Informative but concise |

---

## Alternatives Considered

### Fortification Modeling

**Alternative 1**: Single modifier value per rules edition
- Rejected: Would require runtime branching to determine effect

**Alternative 2**: Separate types for each edition
- Rejected: Unnecessary complexity, enum with modifiers is cleaner

### Durability Zones

**Alternative 1**: Always use speed_sectors for zone calculation
- Rejected: Not flexible for future unit types with different zone distributions

**Alternative 2**: Store zones in separate data file
- Rejected: Over-engineering, optional field in Machine is sufficient

### UI Pattern

**Alternative 1**: Dropdown selector
- Rejected: Less discoverable, requires 2 taps

**Alternative 2**: Toggle button cycling through options
- Rejected: No visual indication of available options

### Info Modal

**Alternative 1**: Inline expansion (accordion)
- Rejected: Would clutter combat modal

**Alternative 2**: Tooltip on hover
- Rejected: Doesn't work on mobile (no hover)

**Alternative 3**: Separate help page
- Rejected: Context-switching during combat is disruptive

---

## References

- `docs/original/official_rules.txt` - Official rules by Технолог
- `docs/panov/fan_rules.txt` - Fan rules by Панов
- `specs/003-official-rules/spec.md` - Feature specification with clarifications
- Existing rules implementations: `src/lib/rules/tehnolog.ts`, `src/lib/rules/fan.ts`
