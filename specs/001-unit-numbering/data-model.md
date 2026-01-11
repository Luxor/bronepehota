# Data Model: Unit Numbering and Count Display

**Feature**: 001-unit-numbering
**Date**: 2025-01-11

## Overview

This document defines the data structures and state transitions for unit count badges and sequential unit numbering features.

---

## Core Type Extensions

### ArmyUnit (Modified)

**Location**: `src/lib/types.ts`

```typescript
interface ArmyUnit {
  // Existing fields (unchanged)
  instanceId: string;
  type: 'squad' | 'machine';
  data: Squad | Machine;
  currentDurability?: number;
  currentAmmo?: Record<string, number>;
  deadSoldiers?: number[];
  actionsUsed: number;
  cost: number;

  // NEW: Unit numbering for identification
  instanceNumber?: number;  // Sequential number per unit type, e.g., 1, 2, 3...
}
```

**Field Details**:
- `instanceNumber`: Optional for backward compatibility
- Assigned when unit is added to army
- Never reused after deletion (FR-008)
- Scoped per unit type (FR-004)
- Maximum value: 99 (FR-010, FR-011)

---

## Utility Function Types

### Count Aggregation

**Location**: `src/lib/unit-utils.ts` (new file)

```typescript
/**
 * Counts units by their template ID (Squad/Machine ID)
 * Returns a map of unit ID -> count
 */
type UnitCountMap = Record<string, number>;

function countByUnitType(units: ArmyUnit[]): UnitCountMap;
```

**Example**:
```typescript
// Input: 3 "Light Assault Clones", 2 "Heavy Mechs"
countByUnitType(army.units);
// Output: { "polaris_light_assault_clone": 3, "polaris_heavy_mech": 2 }
```

---

### Number Assignment

```typescript
/**
 * Calculates the next sequential instance number for a unit type
 */
function getNextInstanceNumber(army: Army, unitId: string): number;

/**
 * Assigns an instance number to a new unit
 */
function assignInstanceNumber(unit: ArmyUnit, number: number): ArmyUnit;
```

**Example**:
```typescript
// Army has 2 "Light Assault Clones" (numbered 1 and 2)
getNextInstanceNumber(army, "polaris_light_assault_clone");
// Returns: 3
```

---

### Validation

```typescript
/**
 * Checks if a unit of the given type can be added (under 99 limit)
 */
function canAddUnit(army: Army, unitId: string): boolean;

/**
 * Validation result with optional error message (Russian)
 */
type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

function validateAddUnit(army: Army, unitId: string): ValidationResult;
```

**Example**:
```typescript
// Army has 99 "Light Assault Clones"
validateAddUnit(army, "polaris_light_assault_clone");
// Returns: { valid: false, error: "Максимум 99 юнитов этого типа" }
```

---

### Display Helpers

```typescript
/**
 * Formats unit number for display (e.g., "#1", "#2")
 */
function formatUnitNumber(unit: ArmyUnit, fallbackIndex?: number): string;

/**
 * Gets display text for count badge
 */
function formatCountBadge(count: number): string | null;
```

**Examples**:
```typescript
formatUnitNumber({ instanceNumber: 3 }); // "#3"
formatUnitNumber({ instanceNumber: undefined }, 2); // "#3" (fallback)
formatCountBadge(0); // null (don't show badge)
formatCountBadge(3); // "3"
```

---

## State Transitions

### Add Unit Flow

```
User clicks "Add" button
    ↓
Validate: count < 99 for this unit type?
    ↓ No                                    ↓ Yes
Show error: "Максимум 99 юнитов"     Calculate next instance number
    ↓                                        ↓
Button disabled/enabled                Create ArmyUnit with instanceNumber
                                          ↓
                                        Append to army.units
                                          ↓
                                        Save to localStorage
                                          ↓
                                        UI updates (badge +1, new unit card)
```

### Remove Unit Flow

```
User clicks "Delete" on unit card
    ↓
Filter unit from army.units by instanceId
    ↓
Save to localStorage
    ↓
UI updates:
  - Badge count -1
  - Unit card removed
  - Other unit numbers unchanged (no renumbering)
```

### Import Army Flow

```
User imports army JSON
    ↓
Parse JSON to Army object
    ↓
For each ArmyUnit:
  - If instanceNumber exists → use it
  - If missing → assign on first add (lazy migration)
    ↓
Save to localStorage
    ↓
UI renders with available numbers
```

---

## Component State Integration

### ArmyBuilder Component

**New State**:
```typescript
const unitCounts = useMemo(() => countByUnitType(army.units), [army.units]);

const getAddButtonProps = (unitId: string) => {
  const count = unitCounts[unitId] || 0;
  const canAdd = count < 99;
  return {
    badge: count > 0 ? count : null,
    disabled: !canAdd,
    error: !canAdd ? "Максимум 99 юнитов этого типа" : undefined,
  };
};
```

### UnitCard Component

**New Props**:
```typescript
interface UnitCardProps {
  unit: ArmyUnit;
  // ... existing props
}

// Display instanceNumber in header
<div className="unit-header">
  <span>{formatUnitNumber(unit)}</span>
  <span>{unit.data.name}</span>
</div>
```

### GameSession Component

**Existing Index-Based Display** (current):
```typescript
// Line 234 in GameSession.tsx
<span>{idx + 1}</span>
```

**New InstanceNumber Display**:
```typescript
// Use instanceNumber if available, fallback to index
<span>{formatUnitNumber(unit, idx)}</span>
```

---

## Data Validation Rules

| Rule | Enforcement | Error Message (Russian) |
|------|-------------|-------------------------|
| Max 99 units per type | Pre-add validation | "Максимум 99 юнитов этого типа" |
| Sequential numbering | Auto-assignment on add | N/A (automatic) |
| No number reuse | Always increment | N/A (automatic) |
| Number display format | Helper function | "#1", "#2", etc. |

---

## Schema Changes

### localStorage Key: `bronepehota_army`

**Before** (existing):
```json
{
  "name": "My Army",
  "faction": "polaris",
  "units": [
    {
      "instanceId": "polaris_light_assault_clone-1234567890",
      "type": "squad",
      "data": { ... },
      "actionsUsed": 0,
      "cost": 50
    }
  ],
  "totalCost": 50
}
```

**After** (with instanceNumber):
```json
{
  "name": "My Army",
  "faction": "polaris",
  "units": [
    {
      "instanceId": "polaris_light_assault_clone-1234567890",
      "type": "squad",
      "data": { ... },
      "instanceNumber": 1,
      "actionsUsed": 0,
      "cost": 50
    },
    {
      "instanceId": "polaris_light_assault_clone-1234567891",
      "type": "squad",
      "data": { ... },
      "instanceNumber": 2,
      "actionsUsed": 0,
      "cost": 50
    }
  ],
  "totalCost": 100
}
```

**Backward Compatibility**:
- Old armies without `instanceNumber` load successfully
- Numbers assigned on next add operation
- Display uses array index as fallback

---

## Type Safety Summary

| Type | Location | Purpose |
|------|----------|---------|
| `ArmyUnit.instanceNumber` | `src/lib/types.ts` | Unit identification |
| `UnitCountMap` | `src/lib/unit-utils.ts` | Count aggregation result |
| `ValidationResult` | `src/lib/unit-utils.ts` | Add validation output |

All new types are defined in TypeScript with proper exports for testing.
