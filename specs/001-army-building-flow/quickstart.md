# Developer Quickstart: Army Building Flow

**Feature**: 001-army-building-flow
**Date**: 2026-01-04

## Overview

This guide helps developers quickly understand and work with the Army Building Flow feature. It covers architecture, setup, and common development tasks.

## Architecture Summary

The Army Building Flow is a **guided multi-step wizard** for constructing armies:

1. **Step 1 - Faction Selection**: Player chooses a faction and sees faction details
2. **Step 1.5 - Point Budget**: Player sets point limit (presets: 250/350/500/1000 or custom)
3. **Step 2 - Unit Selection**: Player adds units within budget constraints
4. **Step 3 - Battle Phase**: Army locked, player proceeds to gameplay

**Key Pattern**: State-driven navigation. The `currentStep` field in `Army` state determines which screen to display.

## File Structure

```
src/
├── components/
│   ├── FactionSelector.tsx       # NEW: Faction selection screen
│   ├── PointBudgetInput.tsx      # NEW: Point budget configuration
│   ├── UnitSelector.tsx          # NEW: Unit selection with budget tracking
│   ├── ArmyBuilder.tsx           # EXTEND: Add step-based rendering
│   └── GameSession.tsx           # EXTEND: Add battle lockout
├── lib/
│   └── types.ts                  # EXTEND: Add Army fields (pointBudget, currentStep, isInBattle)
└── app/
    └── page.tsx                  # EXTEND: Add new state and callbacks
```

## Type Extensions

### Army Type Changes

**Location**: `src/lib/types.ts`

Add three optional fields to the `Army` interface:

```typescript
interface Army {
  name: string;
  faction: FactionID;
  units: ArmyUnit[];
  totalCost: number;

  // NEW FIELDS
  pointBudget?: number;           // Point limit for army construction
  currentStep?: 'faction-select' | 'unit-select' | 'battle';  // Current wizard step
  isInBattle?: boolean;           // Lockout flag for battle phase
}
```

## Component Development Guide

### 1. FactionSelector

**Purpose**: Display faction cards with expandable details.

**Key Implementation Points**:

```typescript
// State for expanded faction card
const [expandedFaction, setExpandedFaction] = useState<FactionID | null>(null);

// Handle faction selection
const handleSelect = (factionId: FactionID) => {
  onFactionSelect(factionId);
  setExpandedFaction(null);  // Collapse after selection
};
```

**Mobile Optimization**:
- Use `horizontal` scroll snap for card navigation
- Minimum card height: 80px
- Full-width on mobile, grid on desktop

**Accessibility**:
- `role="button"` on faction cards
- `aria-pressed={selectedFaction === faction.id}`
- `aria-expanded={expandedFaction === faction.id}`

### 2. PointBudgetInput

**Purpose**: Configure point budget with presets + custom input.

**Key Implementation Points**:

```typescript
// Validation function
const validateValue = (value: number): boolean => {
  return !isNaN(value) && value > 0 && value <= 10000;
};

// Handle preset selection
const handlePreset = (preset: number) => {
  onChange(preset);
  setCustomValue('');  // Clear custom input
};

// Handle custom input
const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setCustomValue(e.target.value);
  const num = parseInt(e.target.value);
  if (validateValue(num)) {
    onChange(num);
    setError('');
  } else {
    setError('Введите число от 1 до 10000');
  }
};
```

**Input Type**: Use `<input type="number">` for mobile keyboard optimization.

### 3. UnitSelector

**Purpose**: Filter and display units with budget-aware controls.

**Key Implementation Points**:

```typescript
// Computed values
const remainingPoints = pointBudget - army.reduce((sum, unit) => sum + unit.data.cost, 0);
const availableUnits = squads.filter(s => s.faction === selectedFaction);

// Check if unit can be added
const canAddUnit = (unit: Squad): boolean => {
  return unit.cost <= remainingPoints;
};

// Add unit handler
const handleAddUnit = (unit: Squad) => {
  if (!canAddUnit(unit)) {
    setShowWarning(true);  // Show "Недостаточно очков" toast
    return;
  }
  const armyUnit: ArmyUnit = {
    instanceId: `${unit.id}_${Date.now()}`,
    type: 'squad',
    data: unit,
  };
  onAddUnit(armyUnit);
};

// Remove unit handler
const handleRemoveUnit = (instanceId: string) => {
  onRemoveUnit(instanceId);
};
```

**Budget Display**:
```typescript
<div className={remainingPoints < 100 ? 'text-red-500' : 'text-green-500'}>
  Осталось очков: {remainingPoints} / {pointBudget}
</div>
```

## Main Page Integration

**Location**: `src/app/page.tsx`

### State Initialization

```typescript
const [army, setArmy] = useState<Army>({
  name: '',
  faction: 'polaris',
  units: [],
  totalCost: 0,
  pointBudget: undefined,
  currentStep: 'faction-select',
  isInBattle: false,
});
```

### Callback Functions

```typescript
// Faction selection
const handleFactionSelect = (factionId: FactionID) => {
  setArmy(prev => ({ ...prev, faction: factionId }));
};

// Point budget set (auto-advance to unit selection)
const handleSetPointBudget = (budget: number) => {
  setArmy(prev => ({
    ...prev,
    pointBudget: budget,
    currentStep: 'unit-select',
  }));
};

// Add unit
const handleAddUnit = (squad: Squad) => {
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

// Remove unit
const handleRemoveUnit = (instanceId: string) => {
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
const handleEnterBattle = () => {
  if (army.units.length === 0) {
    setShowWarning('Армия пуста');
    return;
  }
  setArmy(prev => ({
    ...prev,
    isInBattle: true,
    currentStep: 'battle',
  }));
  setCurrentView('battle');
};

// Exit battle phase (reset army)
const handleEndBattle = () => {
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

### View Rendering

```typescript
return (
  <>
    {currentView === 'builder' && (
      <ArmyBuilder
        army={army}
        currentStep={army.currentStep}
        onFactionSelect={handleFactionSelect}
        onSetPointBudget={handleSetPointBudget}
        onAddUnit={handleAddUnit}
        onRemoveUnit={handleRemoveUnit}
        onEnterBattle={handleEnterBattle}
      />
    )}

    {currentView === 'battle' && (
      <GameSession
        army={army}
        isInBattle={army.isInBattle}
        onEndBattle={handleEndBattle}
      />
    )}
  </>
);
```

## Development Workflow

### 1. Setup

```bash
# Ensure dependencies installed
npm install

# Start dev server
npm run dev
```

### 2. Create Components

```bash
# Create new component files
touch src/components/FactionSelector.tsx
touch src/components/PointBudgetInput.tsx
touch src/components/UnitSelector.tsx
```

### 3. Implement in Order

1. **First**: Update `src/lib/types.ts` with Army extensions
2. **Second**: Implement `FactionSelector` (no dependencies)
3. **Third**: Implement `PointBudgetInput` (no dependencies)
4. **Fourth**: Implement `UnitSelector` (depends on types)
5. **Fifth**: Extend `ArmyBuilder` to integrate new components
6. **Sixth**: Extend `GameSession` for battle lockout
7. **Seventh**: Update `src/app/page.tsx` with new state and callbacks

### 4. Test

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Test on mobile
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M)
# 3. Test touch interactions
```

## Common Development Tasks

### Adding a New Faction Preset

**File**: `src/components/PointBudgetInput.tsx`

```typescript
// Add to preset array
const presets = [250, 350, 500, 1000, 1500];  // Added 1500
```

### Changing Validation Range

**File**: `src/components/PointBudgetInput.tsx`

```typescript
const validateValue = (value: number): boolean => {
  return !isNaN(value) && value > 0 && value <= 20000;  // Changed max to 20000
};
```

### Adding Unit Filtering

**File**: `src/components/UnitSelector.tsx`

```typescript
// Filter by multiple criteria
const availableUnits = squads.filter(s => {
  return s.faction === selectedFaction && s.cost <= remainingPoints && s.name.includes('Tank');
});
```

### Customizing Budget Display Colors

**File**: `src/components/UnitSelector.tsx`

```typescript
const getBudgetColor = (remaining: number, total: number): string => {
  const ratio = remaining / total;
  if (ratio > 0.5) return 'text-green-500';
  if (ratio > 0.2) return 'text-yellow-500';
  return 'text-red-500';
};
```

## Debugging Tips

### Check Current Step

```typescript
console.log('Current step:', army.currentStep);
console.log('Is in battle:', army.isInBattle);
console.log('Point budget:', army.pointBudget);
```

### Inspect localStorage

```javascript
// Browser console
localStorage.getItem('bronepehota_army');
```

### Clear Army State

```javascript
// Browser console
localStorage.removeItem('bronepehota_army');
location.reload();
```

### Check Budget Calculation

```typescript
console.log('Total cost:', army.totalCost);
console.log('Remaining:', army.pointBudget - army.totalCost);
console.log('Unit count:', army.units.length);
```

## Testing Checklist

Before committing, verify:

- [ ] Faction selection: All 3 factions display correctly
- [ ] Faction details: Tap expands card, shows info
- [ ] Point presets: All 4 presets work (250, 350, 500, 1000)
- [ ] Custom input: Validates 1-10000 range, shows errors
- [ ] Unit filtering: Only selected faction units shown
- [ ] Budget tracking: Remaining points updates correctly
- [ ] Add unit: Works when affordable, disabled when not
- [ ] Remove unit: Updates remaining points
- [ ] Over-budget: Warning toast shown
- [ ] Battle transition: "В бой" button works
- [ ] Battle lockout: "Штаб" button disabled
- [ ] Battle exit: Army resets, returns to faction selection
- [ ] Mobile: Touch targets 44x44px minimum
- [ ] Mobile: Unit images clearly visible
- [ ] Refresh: State persists from localStorage
- [ ] Russian: All UI text in Russian

## Constitution Compliance

Per `.specify/memory/constitution.md`:

- [x] **Principle I (Russian UI)**: All user text in Russian
- [x] **Principle II (File-Based Storage)**: Uses existing JSON data
- [x] **Principle III (Client-Side State)**: localStorage with key `bronepehota_army`
- [x] **Principle IV (Type Safety)**: Types in `src/lib/types.ts`, no `any`
- [x] **Principle VI (Mobile-First)**: 44x44px touch targets, responsive layout, visible images

## Resources

- **Specification**: [spec.md](spec.md)
- **Data Model**: [data-model.md](data-model.md)
- **Component Contracts**: [contracts/components.md](contracts/components.md)
- **Constitution**: `.specify/memory/constitution.md`
- **Existing Types**: `src/lib/types.ts`
- **Existing Components**: `src/components/ArmyBuilder.tsx`, `src/components/GameSession.tsx`
