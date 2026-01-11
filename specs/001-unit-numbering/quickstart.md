# Quickstart: Unit Numbering and Count Display

**Feature**: 001-unit-numbering
**For**: Developers implementing this feature

---

## Overview

This guide helps you add unit count badges and sequential numbering to new components or understand the implementation for maintenance.

---

## Implementation Checklist

### Phase 1: Add Types

1. **Update `src/lib/types.ts`**:
   ```typescript
   interface ArmyUnit {
     // ... existing fields
     instanceNumber?: number;  // Add this field
   }
   ```

### Phase 2: Create Utilities

2. **Create `src/lib/unit-utils.ts`** with all functions from `contracts/unit-utils.ts`

3. **Create `src/__tests__/unit-numbering.test.ts`** with tests for:
   - `countByUnitType`
   - `getNextInstanceNumber`
   - `canAddUnit`
   - `validateAddUnit`
   - `formatUnitNumber`
   - `formatCountBadge`

### Phase 3: Update Components

4. **Update `ArmyBuilder.tsx`**:
   - Import utility functions
   - Add `unitCounts` memoized state
   - Add count badges to "Add" buttons
   - Enforce 99-unit limit with validation

5. **Update `UnitCard.tsx`**:
   - Display `instanceNumber` in header
   - Format: `#1`, `#2`, `#3`

6. **Update `GameSession.tsx`**:
   - Use `formatUnitNumber()` instead of `idx + 1`
   - Handle backward compatibility

7. **Update `UnitSelector.tsx`**:
   - Add count badges to unit list

### Phase 4: Test

8. **Manual testing**:
   - Add units and verify count badges update
   - Verify unit numbers assign sequentially
   - Test 99-unit limit enforcement
   - Test import/export with and without `instanceNumber`

9. **Mobile testing**:
   - Verify badges visible on mobile
   - Check touch targets (44x44px minimum)

---

## Adding Unit Numbering to a New Component

### Step 1: Import Utilities

```typescript
import {
  formatUnitNumber,
  countByUnitType,
} from '@/lib/unit-utils';
```

### Step 2: Display Unit Number

```tsx
function MyUnitCard({ unit }: { unit: ArmyUnit }) {
  return (
    <div className="unit-card">
      <span className="unit-number">
        {formatUnitNumber(unit)}
      </span>
      <span>{unit.data.name}</span>
    </div>
  );
}
```

### Step 3: Add Count Badge (if showing Add button)

```tsx
function MyUnitSelector({ units, army, onAdd }) {
  const unitCounts = useMemo(() => {
    return countByUnitType(army.units);
  }, [army.units]);

  return (
    <div>
      {units.map(unit => {
        const count = unitCounts[unit.id] || 0;
        return (
          <div key={unit.id}>
            <span>{unit.name}</span>
            <button onClick={() => onAdd(unit)} className="relative">
              Добавить
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Code Patterns

### Pattern 1: Count Aggregation

```typescript
const unitCounts = useMemo(() => {
  return countByUnitType(army.units);
}, [army.units]);

// Get count for specific unit
const count = unitCounts[unitId] || 0;
```

### Pattern 2: Unit Number Assignment

```typescript
function addUnit(army: Army, template: Squad | Machine): Army {
  const nextNumber = getNextInstanceNumber(army, template.id);
  const newUnit: ArmyUnit = {
    instanceId: `${template.id}-${Date.now()}`,
    type: template.soldiers ? 'squad' : 'machine',
    data: template,
    instanceNumber: nextNumber,
    actionsUsed: 0,
    cost: template.cost,
  };
  return {
    ...army,
    units: [...army.units, newUnit],
    totalCost: army.totalCost + template.cost,
  };
}
```

### Pattern 3: Validation with Error Display

```typescript
const [addError, setAddError] = useState<string | null>(null);

const handleAdd = (unit: Squad | Machine) => {
  const validation = validateAddUnit(army, unit.id);
  if (!validation.valid) {
    setAddError(validation.error);
    setTimeout(() => setAddError(null), 3000);
    return;
  }
  setAddError(null);
  onAddUnit(unit);
};

// In JSX
{addError && (
  <div className="text-red-500 text-sm mt-1">
    {addError}
  </div>
)}
```

---

## Testing Checklist

### Unit Tests (`unit-numbering.test.ts`)

- [ ] `countByUnitType([])` returns `{}`
- [ ] `countByUnitType([unit1, unit2])` counts by type
- [ ] `getNextInstanceNumber()` returns `1` for new type
- [ ] `getNextInstanceNumber()` returns `count + 1` for existing
- [ ] `canAddUnit()` returns `false` at 99 units
- [ ] `canAddUnit()` returns `true` under 99
- [ ] `validateAddUnit()` returns Russian error at limit
- [ ] `formatUnitNumber()` returns `"#1"` format
- [ ] `formatUnitNumber()` falls back to index
- [ ] `formatCountBadge()` returns `null` for 0

### Integration Tests

- [ ] Adding unit increments badge count
- [ ] Removing unit decrements badge count
- [ ] Unit numbers assign sequentially (1, 2, 3...)
- [ ] Unit numbers don't reuse after deletion
- [ ] 99-unit limit prevents add with error
- [ ] Import without `instanceNumber` loads correctly
- [ ] Export preserves `instanceNumber`

### Mobile Tests

- [ ] Count badges visible on mobile viewport
- [ ] Add buttons meet 44x44px touch target
- [ ] Unit numbers readable on small screens
- [ ] Error messages display fully on mobile

---

## Common Issues and Solutions

### Issue: Badge overlaps button text on mobile

**Solution**: Use `min-h-11` on button to ensure height:

```tsx
<button className="relative min-h-11">  // 44px minimum
  Добавить
  <span className="absolute -top-2 -right-2">...</span>
</button>
```

### Issue: Old armies don't have unit numbers

**Solution**: `formatUnitNumber` has fallback:

```typescript
function formatUnitNumber(unit: ArmyUnit, fallbackIndex?: number): string {
  if (unit.instanceNumber) {
    return `#${unit.instanceNumber}`;
  }
  if (fallbackIndex !== undefined) {
    return `#${fallbackIndex + 1}`;
  }
  return '';
}
```

### Issue: Count not updating after add/remove

**Solution**: Ensure `useMemo` dependency array includes `army.units`:

```typescript
const unitCounts = useMemo(() => {
  return countByUnitType(army.units);
}, [army.units]);  // Must include army.units
```

---

## File Locations Reference

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Add `instanceNumber?: number` to `ArmyUnit` |
| `src/lib/unit-utils.ts` | NEW: All utility functions |
| `src/__tests__/unit-numbering.test.ts` | NEW: Unit tests |
| `src/components/ArmyBuilder.tsx` | Add count badges, validation |
| `src/components/UnitCard.tsx` | Display unit number |
| `src/components/GameSession.tsx` | Use `formatUnitNumber` |
| `src/components/UnitSelector.tsx` | Add count badges |

---

## Related Documentation

- [Data Model](./data-model.md) - Type definitions and state transitions
- [Contracts](./contracts/) - Function signatures and component props
- [Research](./research.md) - Technical decisions and rationale
