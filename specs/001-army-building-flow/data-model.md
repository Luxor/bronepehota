# Data Model: Army Building Flow

**Feature**: 001-army-building-flow
**Date**: 2026-01-04
**Status**: Complete

## Overview

This document defines the data model for the Army Building Flow feature, including extensions to existing types and new state management structures.

## Type Extensions

### Army (Extended)

**Location**: `src/lib/types.ts`

**Existing Fields**:
```typescript
interface Army {
  name: string;
  faction: FactionID;
  units: ArmyUnit[];
  totalCost: number;
}
```

**New Fields**:
```typescript
interface Army {
  // ... existing fields ...

  // Point budget for army construction
  pointBudget?: number;

  // Current step in army building flow
  currentStep?: 'faction-select' | 'unit-select' | 'battle';

  // Battle phase lockout flag
  isInBattle?: boolean;

  // Loading state for data fetching
  isLoading?: boolean;

  // Error state for data fetch failures
  loadError?: string;
}
```

**Field Descriptions**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `pointBudget` | `number` | No | `undefined` | Maximum points allowed for army construction. Set after faction selection. |
| `currentStep` | `string` | No | `'faction-select'` | Tracks current step in guided flow. Determines which screen to display. |
| `isInBattle` | `boolean` | No | `false` | When `true`, prevents return to army builder. Set when entering battle phase. |
| `isLoading` | `boolean` | No | `false` | Indicates data fetching is in progress. Used to display loading indicators. |
| `loadError` | `string` | No | `undefined` | Error message from failed data fetch. Used to display error state with retry option. |

**Validation Rules**:
- `pointBudget`: Must be positive integer, range 1-10000
- `currentStep`: Must be one of the three allowed values
- `isInBattle`: Must be boolean

**State Transitions**:

```
[undefined/new] → faction-select (initial state)
faction-select → unit-select (after faction + budget set)
unit-select → battle (after clicking "В бой" / "To Battle")
battle → faction-select (after battle ends, army reset)
```

### Faction (Unchanged)

**Location**: `src/lib/types.ts`

**Existing Type**:
```typescript
interface Faction {
  id: FactionID;
  name: string;
  color: string;
  symbol?: string;
  description: string;
  homeWorld: string;
  motto: string;
}
```

**Usage**: No changes needed. All fields required for faction selection screen already exist.

### Squad (Unchanged)

**Location**: `src/lib/types.ts`

**Existing Type**:
```typescript
interface Squad {
  id: string;
  name: string;
  faction: FactionID;
  cost: number;  // Used for point budget tracking
  soldiers: Soldier[];
  image?: string;
  originalUrl?: string;
}
```

**Usage**: No changes needed. `cost` field already exists for budget calculations.

### ArmyUnit (Unchanged)

**Location**: `src/lib/types.ts`

**Existing Type**:
```typescript
interface ArmyUnit {
  instanceId: string;
  type: 'squad' | 'machine';
  data: Squad | Machine;
  currentDurability?: number;
  currentAmmo?: number;
  grenadesUsed?: boolean;
  deadSoldiers?: number[];
  actionsUsed?: { moved: boolean; shot: boolean; melee: boolean; done: boolean; }[];
  // ... other fields
}
```

**Usage**: No changes needed. Runtime state already supports game session requirements.

## Component State Models

### FactionSelector Component

**Props**:
```typescript
interface FactionSelectorProps {
  factions: Faction[];
  selectedFaction?: FactionID;
  onFactionSelect: (factionId: FactionID) => void;
  onNext?: () => void;  // Optional: if component includes Next button
}
```

**Local State**:
```typescript
const [expandedFaction, setExpandedFaction] = useState<FactionID | null>(null);
```

### PointBudgetInput Component

**Props**:
```typescript
interface PointBudgetInputProps {
  presets: number[];  // [250, 350, 500, 1000]
  value?: number;
  onChange: (value: number) => void;
  onNext?: () => void;
  disabled?: boolean;  // Disabled until faction selected
}
```

**Local State**:
```typescript
const [customValue, setCustomValue] = useState<string>('');
const [error, setError] = useState<string>('');
```

**Loading State Management**:
```typescript
// In FactionSelector and UnitSelector components:
const [isLoading, setIsLoading] = useState(false);
const [loadError, setLoadError] = useState<string | null>(null);
```

### UnitSelector Component

**Props**:
```typescript
interface UnitSelectorProps {
  factions: Faction[];
  squads: Squad[];
  selectedFaction: FactionID;
  pointBudget: number;
  army: ArmyUnit[];
  onAddUnit: (unit: Squad) => void;
  onRemoveUnit: (instanceId: string) => void;
  onToBattle: () => void;
}
```

**Computed State**:
```typescript
const remainingPoints = pointBudget - army.reduce((sum, unit) => sum + (unit.data as Squad).cost, 0);
const availableUnits = squads.filter(s => s.faction === selectedFaction);
const canAffordUnit = (unitCost: number) => unitCost <= remainingPoints;
```

## State Management Pattern

### Main Page State (src/app/page.tsx)

**Extended State**:
```typescript
const [army, setArmy] = useState<Army>({
  name: '',
  faction: 'polaris',  // default, will be overwritten
  units: [],
  totalCost: 0,
  pointBudget: undefined,
  currentStep: 'faction-select',
  isInBattle: false,
  isLoading: false,
  loadError: undefined,
});
```

**Accessibility State**:
```typescript
// In main page and component level:
const [focusedElement, setFocusedElement] = useState<string | null>(null);  // Track focus for keyboard navigation
```
  totalCost: 0,
  pointBudget: undefined,
  currentStep: 'faction-select',
  isInBattle: false,
});

const [currentView, setCurrentView] = useState<'builder' | 'battle'>('builder');
```

**Persistence**:
```typescript
useEffect(() => {
  // Load from localStorage on mount
  const saved = localStorage.getItem('bronepehota_army');
  if (saved) {
    setArmy(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  // Save to localStorage on army change
  localStorage.setItem('bronepehota_army', JSON.stringify(army));
}, [army]);
```

### State Update Functions

```typescript
// Faction selection
const selectFaction = (factionId: FactionID) => {
  setArmy(prev => ({
    ...prev,
    faction: factionId,
  }));
};

// Point budget set
const setPointBudget = (budget: number) => {
  setArmy(prev => ({
    ...prev,
    pointBudget: budget,
    currentStep: 'unit-select',
  }));
};

// Add unit to army
const addUnit = (squad: Squad) => {
  const armyUnit: ArmyUnit = {
    instanceId: `${squad.id}_${Date.now()}`,
    type: 'squad',
    data: squad,
  };
  setArmy(prev => {
    const newUnits = [...prev.units, armyUnit];
    return {
      ...prev,
      units: newUnits,
      totalCost: newUnits.reduce((sum, u) => sum + (u.data as Squad).cost, 0),
    };
  });
};

// Remove unit from army
const removeUnit = (instanceId: string) => {
  setArmy(prev => {
    const newUnits = prev.units.filter(u => u.instanceId !== instanceId);
    return {
      ...prev,
      units: newUnits,
      totalCost: newUnits.reduce((sum, u) => sum + (u.data as Squad).cost, 0),
    };
  });
};

// Enter battle phase
const enterBattle = () => {
  setArmy(prev => ({
    ...prev,
    isInBattle: true,
    currentStep: 'battle',
  }));
  setCurrentView('battle');
};

// Exit battle phase
const exitBattle = () => {
  // Reset army for new construction (per "donabór армии нельзя")
  setArmy({
    name: '',
    faction: 'polaris',
    units: [],
    totalCost: 0,
    pointBudget: undefined,
    currentStep: 'faction-select',
    isInBattle: false,
  });
  setCurrentView('builder');
};
```

## Data Flow Diagrams

### Faction Selection Flow

```
User taps faction card
  ↓
FactionSelector.onFactionSelect(factionId)
  ↓
setArmy({ faction: factionId })
  ↓
Faction card shows selected state
  ↓
User enters point budget
  ↓
PointBudgetInput.onChange(budget)
  ↓
setArmy({ pointBudget: budget, currentStep: 'unit-select' })
  ↓
View transitions to UnitSelector
```

### Unit Selection Flow

```
User views available units (filtered by faction)
  ↓
User taps "Add" on unit
  ↓
Check: unit.cost <= remainingPoints?
  ↓
YES → UnitSelector.onAddUnit(unit)
  → addUnit() creates ArmyUnit
  → setArmy({ units: [...units, armyUnit] })
  → Recalculate totalCost
  → Update UI (remaining points decreases)

NO → Show warning: "Недостаточно очков"
  → Unit not added
```

### Battle Phase Lockout Flow

```
User clicks "В бой" (To Battle)
  ↓
UnitSelector.onToBattle()
  ↓
Check: army.units.length > 0?
  ↓
YES → enterBattle()
  → setArmy({ isInBattle: true, currentStep: 'battle' })
  → setCurrentView('battle')
  → "Штаб" button disabled/hidden

NO → Optional warning: "Армия пуста"
```

### Battle Exit Flow

```
User clicks "Завершить бой" (End battle)
  ↓
exitBattle()
  ↓
setArmy({ /* reset all fields */ })
  → localStorage cleared/reset
  → setCurrentView('builder')
  → View transitions to FactionSelector
  → Fresh start (no pre-loaded units)
```

## Validation Rules

### Point Budget Validation

```typescript
const validatePointBudget = (value: number): string | null => {
  if (isNaN(value)) return 'Введите число';
  if (value <= 0) return 'Введите положительное число';
  if (value > 10000) return 'Максимум 10000 очков';
  return null;  // Valid
};
```

### Faction Selection Validation

```typescript
const canProceedFromFactionSelect = (army: Army): boolean => {
  return army.pointBudget !== undefined &&
         army.pointBudget > 0 &&
         army.faction !== undefined;
};
```

### Battle Entry Validation

```typescript
const canEnterBattle = (army: Army): boolean => {
  return army.units.length > 0;
};
```

## Error States

### Error Message Types

```typescript
type ArmyBuilderError =
  | 'INVALID_POINT_VALUE'
  | 'NO_FACTION_SELECTED'
  | 'INSUFFICIENT_POINTS'
  | 'EMPTY_ARMY'
  | 'FACTION_SWITCH_CONFIRMATION';
```

### Error Display (Russian)

| Error Type | Message | Context |
|------------|---------|---------|
| `INVALID_POINT_VALUE` | "Введите положительное число (1-10000)" | Point budget input validation |
| `NO_FACTION_SELECTED` | "Выберите фракцию" | Attempting to proceed without faction |
| `INSUFFICIENT_POINTS` | "Недостаточно очков" | Attempting to add over-budget unit |
| `EMPTY_ARMY` | "Добавьте юниты перед боем" | Attempting to enter battle with empty army |
| `FACTION_SWITCH_CONFIRMATION` | "Сменить фракцию? Выбранные юниты будут очищены" | Switching factions after unit selection |

## localStorage Schema

### Key: `bronepehota_army`

**Stored Value** (JSON string):
```json
{
  "name": "",
  "faction": "polaris",
  "units": [],
  "totalCost": 0,
  "pointBudget": 500,
  "currentStep": "unit-select",
  "isInBattle": false
}
```

**Hydration**:
```typescript
const loadArmyFromStorage = (): Army | null => {
  const stored = localStorage.getItem('bronepehota_army');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;  // Corrupted data, start fresh
  }
};
```

## Type Safety Guarantees

All types defined in `src/lib/types.ts` per Constitution Principle IV:

- No `any` types used without explicit justification
- All new fields properly typed
- FactionID validated against allowed values
- Compile-time error checking for type mismatches

## Visual Hierarchy Requirements

**Mobile Breakpoints** (per FR-025):
- **Mobile**: < 768px (small screens)
- **Tablet**: 768px - 1024px (medium screens)
- **Desktop**: > 1024px (large screens)

**Visual Hierarchy** (per FR-027):
- **Primary Actions**: "В бой" button, faction cards, preset buttons - largest/most prominent
- **Secondary Actions**: Custom input, add/remove unit buttons - medium prominence
- **Tertiary**: Faction info (motto, homeworld) - expandable details
- **Feedback**: Budget warning toast, error messages - contextual placement

**Component Sizing** (mobile-first):
- Faction cards: Full width on mobile, 3-column grid on desktop
- Preset buttons: Full width, equal spacing, 48px height for touch targets
- Custom input: Full width, numeric keyboard, clear labels (hidden on desktop)
- Budget display: Large, color-coded (green >50%, yellow 20-50%, red <20%)
- Unit cards: Vertical stack on mobile, grid on desktop
- Add/remove buttons: 48x48px minimum, clearly visible

## Accessibility Requirements

**Keyboard Navigation** (per FR-022, FR-023):
- Tab: Navigate between interactive elements
- Arrow keys: Navigate within card lists
- Enter: Select faction, choose preset, add unit
- Escape: Cancel action, close modals
- Focus visible indicators: outline/ring on focused element

**Screen Reader Support** (per FR-024):
- All interactive elements labeled with ARIA labels
- Faction cards: `role="button"`, `aria-label="{faction.name}"`
- Point presets: `aria-label="{points} очков"`
- Add unit button: `aria-label="Добавить {unit.name}"`
- Budget display: `aria-live="polite"` for state changes
- Loading states: `role="status"`, `aria-busy="true"`
- Error messages: `role="alert"`, `aria-live="assertive"`

**Focus Management** (per FR-023):
- Faction cards receive focus when displayed
- Focus moves logically: faction cards → point budget → units → battle
- Disabled elements have `aria-disabled="true"`
- Focus trap prevention during battle phase
- Focus restored when battle ends

**Color Contrast** (per SC-010):
- Faction colors must meet WCAG AA standard (minimum 4.5:1 for normal text, 3:1 for large text)
- Preset buttons: Must maintain contrast ratio in both default and selected states
- Budget warning: Must be readable against dark background (slate-900 theme)
- Error messages: High contrast for visibility

**Text Truncation** (per FR-026):
- Long faction names: Truncate with ellipsis on mobile with full name on hover
- Unit names: Show full name if fits, truncate with ellipsis if too long
- Tooltips: Full text available on hover or long-press

## Migration Notes

No database migration required. Changes are:

1. **Type extensions only**: Adding optional fields to existing `Army` interface
2. **Backward compatible**: Existing code ignores new fields
3. **localStorage safe**: Old stored objects lack new fields, defaults apply
4. **Accessibility additions**: New state for focus tracking and loading states
