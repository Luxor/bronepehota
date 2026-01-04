# Component Contracts: Army Building Flow

**Feature**: 001-army-building-flow
**Date**: 2026-01-04

## Overview

This document defines the interface contracts for all new components in the Army Building Flow feature. Contracts specify props, events, and behavioral guarantees.

## New Components

### FactionSelector

**File**: `src/components/FactionSelector.tsx`

**Purpose**: Display faction selection cards with expandable details. Allows player to choose a faction for their army.

**Props**:
```typescript
interface FactionSelectorProps {
  factions: Faction[];                  // All available factions
  selectedFaction?: FactionID;          // Currently selected faction ID
  onFactionSelect: (factionId: FactionID) => void;  // Callback when faction selected
  onNext?: () => void;                  // Optional: callback when Next button clicked
  nextDisabled?: boolean;               // Whether Next button is disabled
  isLoading?: boolean;                  // Loading state for faction data
  loadError?: string | null;            // Error message if data fetch failed
}
```

**Behavior**:
- Renders faction cards horizontally on mobile, grid on desktop
- Each card shows: faction name, color indicator, brief preview
- Tapping card expands to show: description, motto, homeworld
- Selected faction shows: colored border + checkmark icon
- Minimum tap target: 44x44px (Constitution Principle VI)
- Next button (if provided): disabled until faction selected
- Loading state: displays spinner/skeleton when `isLoading === true`
- Error state: displays inline error message with retry option when `loadError` is set

**Events**:
- `onFactionSelect` called when player taps a faction card
- `onNext` called when player taps "Далее" (Next) button

**Accessibility** (per FR-022, FR-023, FR-024):
- **Keyboard navigation**: Tab to navigate between cards, Arrow keys within grid, Enter/Space to select, Escape to collapse
- **ARIA attributes**:
  - Cards: `role="button"`, `tabindex="0"`, `aria-pressed="{selected}"`
  - `aria-label="Фракция {name}, {selected ? 'выбрана' : 'не выбрана'}"`
  - Expanded details: `aria-expanded="{isExpanded}"`
- **Focus management**:
  - First faction card receives focus on mount
  - Focus moves to selected card after selection
  - Focus trapped within expanded details when open
  - Focus restored to previous position on step transition
- **Screen reader**: Announces faction name and selection state, "Фракция {name}, выбрана" when selected
- **Visual feedback**: Hover/focus ring (outline-2, ring-2), active state (scale-95), disabled state (opacity-50)

**Mobile Considerations** (per FR-025, FR-027):
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- Full-width cards on mobile, 2-column on tablet, 3-column grid on desktop
- Horizontal scroll snap for card navigation on mobile
- Faction images minimum 120px width for identification
- Touch targets: minimum 44x44px (verified in T065a)
- Long faction names: truncate with ellipsis on mobile, full name on hover/tap

---

### PointBudgetInput

**File**: `src/components/PointBudgetInput.tsx`

**Purpose**: Configure army point budget with preset buttons and custom input.

**Props**:
```typescript
interface PointBudgetInputProps {
  presets: number[];                    // Preset values: [250, 350, 500, 1000]
  value?: number;                       // Currently selected budget
  onChange: (value: number) => void;    // Callback when budget changes
  onNext?: () => void;                  // Optional: callback when Next button clicked
  disabled?: boolean;                   // Whether input is disabled
}
```

**Behavior**:
- Renders preset buttons: 250, 350, 500, 1000
- Renders custom number input field
- Preset buttons: highlight when selected
- Custom input: validates on blur (1-10000 range)
- Error message displayed inline near input for invalid input (per FR-028)
- Next button (if provided): disabled until valid value selected
- Minimum tap target: 44x44px for all buttons (verified in T065b)
- Loading state: not applicable (synchronous validation)

**Validation Rules**:
- Must be positive integer
- Minimum: 1, Maximum: 10000
- Empty input: treated as invalid

**Events**:
- `onChange` called when preset button tapped or custom input validated
- `onNext` called when player taps "Далее" (Next) button

**Error Messages (Russian)**:
- Empty: "Введите количество очков"
- Invalid: "Введите число от 1 до 10000"
- Negative/zero: "Введите положительное число"

**Accessibility** (per FR-022, FR-023, FR-028):
- **Keyboard navigation**: Tab to navigate between presets and input, Enter to select preset, Escape to clear custom input
- **ARIA attributes**:
  - Preset buttons: `role="button"`, `aria-pressed="{selected}"`, `aria-label="{points} очков"`
  - Input: `aria-invalid="{hasError}"`, `aria-describedby="budget-error"`
  - Error message: `role="alert"`, `aria-live="assertive"`, `id="budget-error"`
- **Focus management**:
  - First preset button receives focus when component renders
  - Focus moves to input when custom value typed
  - Error message announced when validation fails
- **Visual feedback**: Selected state (ring-2, ring-offset-2), hover state (bg-slate-700), focus ring (outline-2), disabled state (opacity-50, cursor-not-allowed)

**Mobile Considerations** (per FR-025, FR-027):
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- Large preset buttons (48px height) for touch targets
- Number input: `type="number"` for mobile numeric keyboard
- Error message: displayed inline above keyboard on mobile
- Visual feedback: Touch ripple effect, haptic feedback on selection (if supported)

---

### UnitSelector

**File**: `src/components/UnitSelector.tsx`

**Purpose**: Display available units for selected faction with budget-aware add/remove controls.

**Props**:
```typescript
interface UnitSelectorProps {
  factions: Faction[];                  // All factions (for faction badge)
  squads: Squad[];                      // All squads (filtered by selected faction)
  selectedFaction: FactionID;           // Currently selected faction
  pointBudget: number;                  // Point budget limit
  army: ArmyUnit[];                     // Currently selected units
  onAddUnit: (squad: Squad) => void;    // Callback when unit added
  onRemoveUnit: (instanceId: string) => void;  // Callback when unit removed
  onToBattle: () => void;               // Callback when entering battle phase
  isLoading?: boolean;                  // Loading state for squad data
  loadError?: string | null;            // Error message if data fetch failed
}
```

**Behavior**:
- Displays units filtered by `selectedFaction`
- Each unit card shows: image, name, cost, faction badge
- Budget display: "Осталось очков: X / Y" (Remaining points) with color coding
  - Green (>50% remaining): text-green-400
  - Yellow (20-50% remaining): text-yellow-400
  - Red (<20% remaining): text-red-400
- Add button: disabled if `unit.cost > remainingPoints`
- Remove button: always enabled on army units
- Warning toast when attempting over-budget add
- "В бой" (To Battle) button: enabled when army has units
- Loading state: displays spinner/skeleton when `isLoading === true`
- Error state: displays inline error message with retry option when `loadError` is set

**Computed State**:
```typescript
remainingPoints = pointBudget - army.reduce((sum, unit) => sum + unit.data.cost, 0)
canAffordUnit = (unitCost) => unitCost <= remainingPoints
armyUnits = army.filter(u => u.type === 'squad')  // Only squads for MVP
```

**Events**:
- `onAddUnit` called when player taps "Добавить" (Add) button
- `onRemoveUnit` called when player taps remove icon on army unit
- `onToBattle` called when player taps "В бой" (To Battle) button

**Warning Messages (Russian)**:
- Over-budget: "Недостаточно очков" (Not enough points)
- Empty army warning (optional): "Армия пуста" (Army is empty)
- Data load error: "Ошибка загрузки данных" (Data load error)

**Accessibility** (per FR-022, FR-023, FR-024):
- **Keyboard navigation**: Tab to navigate between unit cards and buttons, Enter to add/remove, Arrow keys within unit lists
- **ARIA attributes**:
  - Unit cards: `role="button"`, `tabindex="0"`, `aria-label="Юнит {name}, стоимость {cost} очков"`
  - Add button: `aria-label="Добавить {unit.name}"`, `aria-disabled="{!canAfford}"`
  - Remove button: `aria-label="Удалить {unit.name}"`
  - Budget display: `aria-live="polite"`, `role="status"`, `aria-label="Осталось {remaining} из {total} очков"`
  - Toast: `role="alert"`, `aria-live="assertive"`
  - Loading: `role="status"`, `aria-busy="true"`
  - Error: `role="alert"`, `aria-live="assertive"`
- **Focus management**:
  - First unit card receives focus when component renders
  - Focus moves to newly added unit in army list
  - Focus trapped in modal/dialog when open
  - Budget changes announced to screen readers
- **Screen reader**: Announces unit details when focused, budget updates on each add/remove
- **Visual feedback**: Hover/focus ring, disabled state (opacity-50, grayscale), selected state (ring-2)

**Mobile Considerations** (per FR-025, FR-027):
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- Unit images minimum 120px width for identification (verified in T066b, T066c)
- Add/remove buttons: minimum 48x48px (verified in T065c)
- Vertical unit card stack on mobile, grid on desktop
- Bottom sheet for unit details on mobile
- Swipe-to-dismiss for toasts
- Long unit names: truncate with ellipsis on mobile
- Budget display: Large text, high contrast colors for visibility

---

## Extended Components

### ArmyBuilder (Extended)

**File**: `src/components/ArmyBuilder.tsx`

**Changes**:
- Add `currentStep` prop to control sub-component rendering
- Add `onStepChange` callback for navigation
- Integrate new components: `FactionSelector`, `PointBudgetInput`, `UnitSelector`

**New Props**:
```typescript
interface ArmyBuilderProps {
  // ... existing props ...
  currentStep?: 'faction-select' | 'unit-select';
  onStepChange?: (step: 'faction-select' | 'unit-select' | 'battle') => void;
}
```

**New Behavior**:
- Render `FactionSelector` when `currentStep === 'faction-select'`
- Render `PointBudgetInput` below faction selection
- Render `UnitSelector` when `currentStep === 'unit-select'`
- Transition to `GameSession` when `currentStep === 'battle'`

---

### GameSession (Extended)

**File**: `src/components/GameSession.tsx`

**Changes**:
- Add `isInBattle` prop
- Add `onEndBattle` callback
- Disable/hide "Штаб" button when `isInBattle === true`
- Add "Завершить бой" (End battle) button

**New Props**:
```typescript
interface GameSessionProps {
  // ... existing props ...
  isInBattle?: boolean;
  onEndBattle?: () => void;
}
```

**New Behavior**:
- When `isInBattle === true`: hide/disable return to ArmyBuilder
- Display "Завершить бой" button in battle header
- Call `onEndBattle` when player ends battle

---

## Main Page Integration

### src/app/page.tsx

**State Extensions**:
```typescript
const [army, setArmy] = useState<Army>({
  // ... existing fields ...
  pointBudget: undefined,
  currentStep: 'faction-select',
  isInBattle: false,
});
```

**New Callbacks**:
```typescript
const handleFactionSelect = (factionId: FactionID) => {
  setArmy(prev => ({ ...prev, faction: factionId }));
};

const handleSetPointBudget = (budget: number) => {
  setArmy(prev => ({
    ...prev,
    pointBudget: budget,
    currentStep: 'unit-select',
  }));
};

const handleEnterBattle = () => {
  setArmy(prev => ({
    ...prev,
    isInBattle: true,
    currentStep: 'battle',
  }));
  setCurrentView('battle');
};

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

**View Logic**:
```typescript
// When currentView === 'builder':
// - Render ArmyBuilder with currentStep prop
// - ArmyBuilder renders appropriate sub-component based on currentStep

// When currentView === 'battle':
// - Render GameSession with isInBattle prop
// - GameSession hides "Штаб" button, shows "Завершить бой"
```

---

## Contract Guarantees

### Performance

- Component renders: <16ms (60fps target)
- State updates: Synchronous via useState
- localStorage operations: <10ms (typical)
- Loading states: Display within 200ms per FR-021, SC-012

### Reliability

- localStorage fallback: If unavailable, feature degrades gracefully (session-only)
- State corruption: Invalid stored data ignored, fresh start

### Data Integrity

- Budget enforcement: Client-side validation prevents over-budget adds
- Type safety: TypeScript compile-time checks prevent type errors

### Mobile Support (per Constitution Principle VI, FR-018, FR-019, FR-025)

- **Touch targets**: Minimum 44x44px (48x48px for action buttons)
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Image quality**: Unit/faction images minimum 120px width, clearly identifiable on mobile
- **Responsive**: Full-width components on mobile, multi-column on tablet/desktop
- **Input optimization**: Numeric keyboard for point input, touch-friendly presets
- **Visual hierarchy**: Large buttons, clear labels, high contrast, color-coded feedback
- **Performance**: Optimized for mobile networks (lazy loading images, efficient re-renders)

---

## Testing Contracts

### Unit Tests Required

**FactionSelector**:
- Renders all factions
- Calls onFactionSelect when card tapped
- Shows expanded details on tap
- Highlights selected faction
- Disabled Next button when no faction selected
- **Accessibility**: Keyboard navigation works, ARIA labels correct, focus management works
- **Mobile**: Touch targets 44x44px, images 120px minimum, responsive layout
- **Loading**: Loading spinner displays when `isLoading === true`
- **Error**: Error message displays with retry when `loadError` is set

**PointBudgetInput**:
- Renders all preset buttons
- Calls onChange with preset value when tapped
- Validates custom input (1-10000 range)
- Shows error message for invalid input
- Disabled Next button when no valid value
- **Accessibility**: Keyboard navigation works, ARIA labels correct, error announced
- **Mobile**: Touch targets 44x44px, numeric keyboard displays, responsive layout
- **Validation**: All edge cases handled (negative, zero, >10000)

**UnitSelector**:
- Filters units by selected faction
- Calculates remaining points correctly
- Disables add button when over budget
- Calls onAddUnit when add button tapped
- Calls onRemoveUnit when remove tapped
- Enables "В бой" button when army has units
- Shows warning for over-budget add attempt
- **Accessibility**: Keyboard navigation works, ARIA labels correct, budget updates announced
- **Mobile**: Touch targets 48x48px, images 120px minimum, responsive layout
- **Budget display**: Color-coded (green/yellow/red), updates live
- **Loading**: Loading spinner displays when `isLoading === true`
- **Error**: Error message displays with retry when `loadError` is set

**Integration**:
- State persistence across refresh
- Faction selection → Point budget → Unit selection flow
- Battle phase lockout prevents army builder access
- Battle exit resets to faction selection
- **Accessibility**: Focus flows correctly between steps, keyboard navigation persists
- **Mobile**: All steps work on mobile, responsive transitions
- **Loading**: Loading states display correctly across steps
- **Error**: Error states handled gracefully with retry options

---

## Russian UI Text

All user-facing text in Russian per Constitution Principle I:

| Element | Russian Text |
|---------|--------------|
| Faction selection | "Выберите фракцию" |
| Next button | "Далее" |
| Point budget label | "Очки армии" |
| Remaining points | "Осталось очков: X / Y" |
| Add unit | "Добавить" |
| Remove unit | "Удалить" |
| To battle | "В бой" |
| End battle | "Завершить бой" |
| Army builder | "Штаб" |
| Battle session | "В Бой" |
| Error: insufficient points | "Недостаточно очков" |
| Error: no faction | "Выберите фракцию" |
| Error: invalid budget | "Введите число от 1 до 10000" |
| Error: negative budget | "Введите положительное число" |
| Error: empty budget | "Введите количество очков" |
| Error: data load failed | "Ошибка загрузки данных" |
| Error: empty army | "Армия пуста" |
| Empty units list | "Нет доступных юнитов" |
| Confirm faction switch | "Сменить фракцию? Выбранные юниты будут очищены" |
| Loading state | "Загрузка..." |
| Retry button | "Повторить" |
