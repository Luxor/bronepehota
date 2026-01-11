# Contract: Component Props Extensions

**Components**: ArmyBuilder, UnitCard, GameSession, UnitSelector
**Purpose**: Props and state needed for count badges and unit numbering

---

## ArmyBuilder Component

### Existing Props (Unchanged)

```typescript
interface ArmyBuilderProps {
  army: Army;
  onArmyChange: (army: Army) => void;
  faction: FactionID;
}
```

### New Internal State

```typescript
// Computed count map for badges
const unitCounts: Record<string, number> = useMemo(() => {
  return countByUnitType(army.units);
}, [army.units]);
```

### New Helper Props for Unit Cards

```typescript
interface UnitCardDisplayInfo {
  unit: ArmyUnit;
  countBadge: number | null;  // null = don't show badge
  canAddMore: boolean;
  errorMessage?: string;
}

function getUnitDisplayInfo(
  unit: Squad | Machine,
  army: Army
): UnitCardDisplayInfo;
```

### Add Button Contract

```typescript
interface AddButtonProps {
  unitId: string;
  currentCount: number;
  onAdd: () => void;
  disabled?: boolean;
}

// Renders button with optional badge in corner
<button
  onClick={onAdd}
  disabled={disabled || currentCount >= 99}
  className="relative"  // Required for badge positioning
>
  Добавить
  {currentCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {currentCount}
    </span>
  )}
</button>
```

---

## UnitCard Component

### Existing Props (Unchanged)

```typescript
interface UnitCardProps {
  unit: ArmyUnit;
  onRemove: (instanceId: string) => void;
  onUpdate: (unit: ArmyUnit) => void;
  // ... other props
}
```

### New Display Requirements

**Unit Header Must Include**:
```tsx
<div className="unit-header">
  {/* Unit number - prominent display */}
  <span className="text-lg font-bold">
    {formatUnitNumber(unit)}
  </span>
  <span>{unit.data.name}</span>
</div>
```

**Visual Specifications**:
- Unit number format: `#1`, `#2`, `#3` (hash + number)
- Font weight: Bold
- Position: Before unit name
- Color: Faction color or neutral gray
- Fallback: Use array index if `instanceNumber` undefined

---

## GameSession Component

### Existing State (Unchanged)

```typescript
interface GameSessionProps {
  army: Army;
  onArmyChange: (army: Army) => void;
  // ... other props
}
```

### Unit Navigation Display

**Current Implementation** (index-based):
```tsx
// Line 234 in GameSession.tsx
<span>{idx + 1}</span>
```

**New Contract** (instanceNumber-aware):
```tsx
<span>
  {formatUnitNumber(unit, idx)}
</span>
```

**Behavior**:
- Use `unit.instanceNumber` if available
- Fallback to `idx + 1` for backward compatibility
- Format: `#1`, `#2`, `#3`

---

## UnitSelector Component

### New Props for Count Badges

```typescript
interface UnitSelectorProps {
  squads: Squad[];
  army: Army;
  onAddUnit: (squad: Squad) => void;
  // ... existing props
}

// Internal state for counts
const unitCounts = useMemo(() => {
  return countByUnitType(army.units);
}, [army.units]);
```

### Unit List Item Contract

Each selectable unit should display:

```tsx
<div className="unit-item">
  <span>{squad.name}</span>
  <button onClick={() => onAddUnit(squad)} className="relative">
    Добавить
    {unitCounts[squad.id] > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unitCounts[squad.id]}
      </span>
    )}
  </button>
</div>
```

---

## Shared UI Components

### CountBadge Component (Optional New Component)

```typescript
interface CountBadgeProps {
  count: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  color?: string;  // Faction color or default red
}

// Usage
<CountBadge count={3} position="top-right" />
```

**Render Contract**:
- Do not render if `count === 0`
- Circular background, rounded-full
- Minimum size: 20x20px (h-5 w-5 in Tailwind)
- Text centered, white color
- Positioned absolutely relative to parent button

---

## Error Display Contract

### Validation Errors

When user attempts to add unit at limit (99):

```typescript
interface ErrorMessageProps {
  message: string;  // Russian text
  duration?: number;  // Auto-dismiss after ms (default: 3000)
}

// Display as toast below button
<ErrorMessage message="Максимум 99 юнитов этого типа" />
```

**Visual Specifications**:
- Position: Below or near the Add button
- Background: Red or warning color
- Text: White, Russian
- Duration: 3 seconds auto-dismiss
- Mobile: Full width or floating toast

---

## Mobile Responsiveness

### Touch Target Requirements

All interactive elements with badges must maintain **44x44px minimum** tap target:

```tsx
// Button + badge combined = 44x44px minimum
<button className="min-h-11 min-w-11 relative">  // h-11 = 44px
  Добавить
  <span className="absolute -top-2 -right-2 h-5 w-5">
    {count}
  </span>
</button>
```

### Responsive Badge Visibility

- Desktop: Badge visible on all unit cards
- Mobile: Badge visible, may overlap button text slightly
- Small screens: Badge scales with font-size-xs

---

## TypeScript Module Contract

All components must import from `unit-utils`:

```typescript
import {
  countByUnitType,
  canAddUnit,
  validateAddUnit,
  formatUnitNumber,
  formatCountBadge,
} from '@/lib/unit-utils';
```
