# Data Model: Enhanced Rules Version Selector

**Feature**: 001-rules-selector
**Date**: 2026-01-16
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data model extensions required for the enhanced rules version selector. The primary changes involve extending the existing `RulesVersion` interface with display fields and defining the component state structures.

---

## Extended Types

### RulesVersion (Modified)

**Location**: `src/lib/types.ts`

```typescript
export interface RulesVersion {
  // Existing fields (unchanged)
  id: RulesVersionID;
  name: string;
  source: string;
  calculateHit: CalculateHitFn;
  calculateDamage: CalculateDamageFn;
  calculateMelee: CalculateMeleeFn;
  supportsSpecialEffects: boolean;

  // NEW fields for display
  description?: string;      // 2-3 sentence explanation in Russian
  features?: string[];       // Array of key differences/abilities in Russian
  color?: string;            // Hex color code for visual theme (e.g., "#ef4444")
}
```

**Validation Rules**:
- `description`: Max 200 characters, Russian text, optional
- `features`: Array of strings, each max 100 characters, Russian text, optional
- `color`: Valid hex color code (7 chars with #), optional

**Default Values**:
- `description`: `"Описание недоступно"` if not provided
- `features`: `[]` if not provided
- `color`: `"#94a3b8"` (slate-400) if not provided

---

## Component State Models

### RulesSelector State

**Component**: `src/components/RulesSelector.tsx`

```typescript
interface RulesSelectorState {
  expandedRulesId: RulesVersionID | null;  // Currently expanded card for details
  selectedVersion: RulesVersionID;          // Currently selected rules version
}

interface RulesSelectorProps {
  versions: RulesVersion[];                 // All available rules versions
  selectedVersion: RulesVersionID;          // Current selection
  onVersionChange: (id: RulesVersionID) => void;  // Selection callback
}
```

**State Transitions**:

```
Initial State (mount):
  selectedVersion: from props or localStorage
  expandedRulesId: selectedVersion (auto-expand)

User clicks card:
  expandedRulesId: clickedId (toggle: null if already expanded)
  selectedVersion: clickedId (always updates on click)

User clicks same card (expanded):
  expandedRulesId: null (collapse)
  selectedVersion: unchanged (maintains selection)

Keyboard navigation:
  Arrow keys: move focus between cards
  Enter/Space: select focused card, toggle expansion
  Escape: collapse expanded card
```

---

### RulesModal State

**Component**: `src/components/RulesModal.tsx` (new)

```typescript
interface RulesModalState {
  isOpen: boolean;                          // Modal visibility
}

interface RulesModalProps {
  isOpen: boolean;                          // Modal visibility (controlled)
  onClose: () => void;                      // Close callback
  selectedVersion: RulesVersionID;          // Current selection
  onVersionChange: (id: RulesVersionID) => void;  // Selection callback
}
```

**State Diagram**:

```
[Closed] --open()--> [Open]
   ^                    |
   |                    | close()
   +--------------------+
```

---

### RulesVersionSelector (Modified)

**Component**: `src/components/RulesVersionSelector.tsx`

```typescript
interface RulesVersionSelectorState {
  isModalOpen: boolean;                     // Modal visibility state
}

interface RulesVersionSelectorProps {
  selectedVersion: RulesVersionID;          // Current selection
  onVersionChange: (id: RulesVersionID) => void;  // Selection callback
}
```

**Changes from Original**:
- `<select>` dropdown replaced with compact `<button>`
- Button shows current version name with colored badge
- Click opens `RulesModal` instead of dropdown

---

## Data Flow Diagrams

### Initial Load Flow

```
[page.tsx mount]
    |
    v
[localStorage.getItem('bronepehota_rules_version')]
    |
    +---> [Valid?] --> [setRulesVersion(saved)] --> [RulesSelector renders with saved version]
    |
    +---> [Invalid?] --> [setRulesVersion('tehnolog')] --> [RulesSelector renders with default]
```

### Selection Change Flow

```
[User clicks rules card]
    |
    v
[RulesSelector.onVersionChange(newVersion)]
    |
    +---> [Immediate: setRulesVersion(newVersion)] --> [UI re-renders with new selection]
    |
    +---> [Debounced (300ms): localStorage.setItem('bronepehota_rules_version', newVersion)]
    |
    v
[All game calculations use new rules version]
```

### Modal Flow

```
[User clicks header button]
    |
    v
[RulesVersionSelector.setIsModalOpen(true)]
    |
    v
[RulesModal renders with isOpen=true]
    |
    +---> [User selects version] --> [onVersionChange(newVersion)] --> [onClose()] --> [Modal closes]
    |
    +---> [User clicks outside/X] --> [onClose()] --> [Modal closes, no version change]
```

---

## Registry Data Structure

### rules-registry Exports

**Location**: `src/lib/rules-registry.ts`

```typescript
// Extended exports with display data
export const tehnologRules: RulesVersion = {
  id: 'tehnolog',
  name: 'Технолог',
  source: 'docs/original/official_rules.txt',
  description: 'Официальные правила игры от Технолог. Используют прямое сравнение для попадания и "виртуальную стрельбу" для урона — каждый кубик больше брони наносит 1 ранение. Простейшие и наиболее понятные правила для начинающих.',
  features: [
    'Виртуальная стрельба: кубик > брони = 1 ранение',
    'Укрытия добавляются к броне цели',
    'Простые расчёты без спецэффектов'
  ],
  color: '#ef4444',
  calculateHit: /* existing implementation */,
  calculateDamage: /* existing implementation */,
  calculateMelee: /* existing implementation */,
  supportsSpecialEffects: false,
};

export const fanRules: RulesVersion = {
  id: 'fan',
  name: 'Фанатская Редакция',
  source: 'docs/panov/fan_rules.txt',
  description: 'Альтернативные правила от Панова с расширенными механиками. Используют зонную систему повреждений для техники и поддерживают спецэффекты оружия. Более сложные, но тактически глубокие правила для опытных игроков.',
  features: [
    'Зонные повреждения техники: зелёный/жёлтый/красный сектор',
    'Спецэффекты: Взрыв, Ремонт, Burst',
    'Укрытия увеличивают дистанцию'
  ],
  color: '#3b82f6',
  calculateHit: /* existing implementation */,
  calculateDamage: /* existing implementation */,
  calculateMelee: /* existing implementation */,
  supportsSpecialEffects: true,
};
```

---

## Client Storage Schema

### localStorage Keys

| Key | Type | Description | Default |
|-----|------|-------------|---------|
| `bronepehota_rules_version` | `string` | Selected rules version ID | `"tehnolog"` |

**Value Validation**:
```typescript
function isValidRulesVersion(id: string): id is RulesVersionID {
  return id === 'tehnolog' || id === 'fan';
}
```

**Migration Notes**:
- Existing deployments already use this key (feature 002)
- No migration required
- Invalid values fall back to `"tehnolog"`

---

## Component Relationships

```text
┌─────────────────────────────────────────────────────────────┐
│                        page.tsx                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Rules Version State                     │   │
│  │  rulesVersion: RulesVersionID                       │   │
│  │  setRulesVersion: (id) => void                      │   │
│  └───────────────┬─────────────────────────────────────┘   │
│                  │                                         │
│      ┌───────────┴───────────┐                            │
│      │                       │                            │
│      v                       v                            │
│  ┌─────────────┐    ┌──────────────────┐                 │
│  │ RulesModal  │    │ RulesSelector    │                 │
│  │ (header)    │    │ (faction-select) │                 │
│  └─────────────┘    └──────────────────┘                 │
│                              │                            │
│                              v                            │
│                     ┌────────────────┐                   │
│                     │ getAllRules()  │                   │
│                     │ from registry  │                   │
│                     └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

**Modified Files**:
1. `src/lib/types.ts` - Extend `RulesVersion` interface
2. `src/lib/rules/tehnolog.ts` - Add description, features, color
3. `src/lib/rules/fan.ts` - Add description, features, color
4. `src/components/RulesVersionSelector.tsx` - Replace dropdown with button

**New Files**:
1. `src/components/RulesSelector.tsx` - Card-based selector component
2. `src/components/RulesModal.tsx` - Modal dialog for header access

**No Database Changes**: All data is code-defined in registry modules

**Type Safety**: All changes maintain TypeScript type safety with extended interfaces
