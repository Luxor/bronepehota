# Research: Unit Numbering and Count Display

**Feature**: 001-unit-numbering
**Date**: 2025-01-11
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing unit count badges and sequential unit numbering in the Bronepehota web application.

---

## Decision 1: Count Aggregation Strategy

**Question**: Should unit type counts be computed on-demand or memoized?

**Decision**: On-demand computation with React `useMemo` optimization

**Rationale**:
- Army state size is small (typically <50 units), making on-demand computation fast (<1ms)
- `useMemo` prevents unnecessary recalculations during re-renders
- Avoids state synchronization complexity between army.units and cached counts
- Simpler code with fewer bugs

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Memoized state in Army object | Adds sync complexity; counts are derived data, not core state |
| Server-side computation | Not applicable; all state is client-side |
| Web Worker | Overkill for <50 unit arrays |

**Implementation Pattern**:
```typescript
const unitCounts = useMemo(() => {
  return army.units.reduce((acc, unit) => {
    const key = unit.data.id; // Squad/Machine ID
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}, [army.units]);
```

---

## Decision 2: Unit Number Assignment Scope

**Question**: Should numbering be per-faction, per-unit-type, or global across all units?

**Decision**: Per-unit-type numbering (e.g., "Light Assault Clone #1", "Heavy Mech #1")

**Rationale**:
- Aligns with FR-004 requirement ("independently by type")
- More intuitive for players: "#1" refers to first unit of that specific type
- GameSession already uses per-type identification patterns
- Simplifies communication: "Атакует Клон лёгкого штурма #3" vs "Атакует Юнит #7"

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Global sequential across all units | Confusing: "Light Assault Clone #1" and "Heavy Mech #2" |
| Per-faction numbering | Doesn't distinguish between different unit types |

**Number Assignment Logic**:
```typescript
function getNextInstanceNumber(army: Army, unitId: string): number {
  const existing = army.units.filter(u => u.data.id === unitId);
  return existing.length + 1;
}
```

---

## Decision 3: Badge UI Implementation Pattern

**Question**: Which Tailwind CSS pattern for button corner notification badges?

**Decision**: Absolute-positioned badge with circular background, top-right corner

**Rationale**:
- Matches industry standard (GitHub notifications, shopping cart badges)
- Tailwind provides utilities: `absolute -top-2 -right-2`, `rounded-full`
- Can scale with count (1-2 digits)
- Works with existing button styles

**Mobile Considerations**:
- Badge itself part of button tap target (combined 44x44px+ minimum)
- High contrast color (faction-colored or red for attention)
- Minimum 20x20px badge size for readability

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Text in button ("Add (3)") | Less scannable; breaks with long translations |
| Separate count label | Takes more screen space on mobile |
| Color-coded bar only | No numeric information |

**Tailwind Pattern**:
```tsx
<button className="relative">
  Добавить
  {count > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {count}
    </span>
  )}
</button>
```

---

## Decision 4: Import/Export Compatibility Strategy

**Question**: How to handle armies imported without `instanceNumber` field?

**Decision**: Lazy migration with null coalescing

**Rationale**:
- Backward compatible: Old armies without numbers still load
- Numbers assigned on first modification (add/remove)
- Display fallback: Use array index when `instanceNumber` undefined

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Immediate migration on import | Complex; requires versioning schema |
| Reject imports without numbers | Breaks existing user armies |
| Separate migration script | Overkill for optional field |

**Implementation Pattern**:
```typescript
// Type definition with optional field
interface ArmyUnit {
  // ... existing fields
  instanceNumber?: number; // Optional for backward compatibility
}

// Display fallback
function getUnitNumber(unit: ArmyUnit, index: number): string {
  return unit.instanceNumber ? `#${unit.instanceNumber}` : `#${index + 1}`;
}

// Assignment on add
function addUnit(army: Army, template: Squad | Machine): Army {
  const nextNumber = getNextInstanceNumber(army, template.id);
  const newUnit: ArmyUnit = {
    // ... existing fields
    instanceNumber: nextNumber,
  };
  return { ...army, units: [...army.units, newUnit] };
}
```

---

## Decision 5: Maximum Unit Limit Enforcement

**Question**: Where should the 99-unit limit be enforced?

**Decision**: Pre-add validation with inline error message

**Rationale**:
- Prevents invalid state (no army with 100+ units can exist)
- Immediate user feedback (no button flash/disappear)
- Aligns with FR-011 requirement

**Mobile UX Considerations**:
- Toast message below button for visibility
- Auto-dismiss after 3 seconds
- Russian text: "Максимум 99 юнитов этого типа"

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Disable button at 99 | Less clear why disabled |
| Post-add validation with rollback | Jarring UX; animation issues |
| Server-side validation | Not applicable; client-only |

**Implementation Pattern**:
```typescript
function canAddUnit(army: Army, unitId: string): boolean {
  const count = army.units.filter(u => u.data.id === unitId).length;
  return count < 99;
}

// In component
const handleAdd = () => {
  if (!canAddUnit(army, unit.id)) {
    setError("Максимум 99 юнитов этого типа");
    return;
  }
  addUnit(army, unit);
};
```

---

## Additional Research Findings

### React State Derivation for localStorage-Persisted Army

**Finding**: Use derived state pattern with `useMemo` for computed values. The Army object in localStorage is the source of truth; computed counts and numbering are derived from it.

**Reference**: React docs on "Derived State" - avoid duplicating source of truth

### TypeScript Utility Functions for Count Aggregation

**Finding**: Use `Array.reduce()` for grouping, `Record<string, number>` for count map. Type-safe with proper generics.

```typescript
function countByUnitType(units: ArmyUnit[]): Record<string, number> {
  return units.reduce((acc, unit) => {
    const id = unit.data.id;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
```

### Mobile Touch Target Best Practices

**Finding**:
- Minimum 44x44px for single-touch targets (iOS Human Interface Guidelines)
- Badge should extend button tap area, not replace it
- Visual feedback: scale animation on tap
- High contrast: faction color or red ( Tailwind `bg-red-500`)

---

## Summary of Technical Decisions

| Decision | Choice | Key Tradeoff |
|----------|--------|--------------|
| Count aggregation | On-demand with useMemo | CPU for simplicity |
| Numbering scope | Per-unit-type | Clarity over uniqueness |
| Badge UI | Corner circle badge | Convention over custom |
| Compatibility | Lazy migration | Flexibility over purity |
| Limit enforcement | Pre-add validation | Prevention over rollback |

---

## Open Questions (None)

All unknowns from Phase 0 have been resolved through research and documented above.
