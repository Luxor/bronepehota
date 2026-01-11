# Contract: Unit Utils Module

**Module**: `src/lib/unit-utils.ts` (new file)
**Purpose**: Utility functions for unit count aggregation and numbering

## Exports

### Functions

```typescript
/**
 * Counts units by their template ID (Squad/Machine ID)
 * @param units - Array of army units
 * @returns Record mapping unit ID to count
 */
export function countByUnitType(units: ArmyUnit[]): Record<string, number>;

/**
 * Gets the next sequential instance number for a unit type
 * @param army - Current army state
 * @param unitId - Template ID of unit type
 * @returns Next number to assign (1-indexed)
 */
export function getNextInstanceNumber(army: Army, unitId: string): number;

/**
 * Assigns an instance number to a unit
 * @param unit - Unit to modify
 * @param number - Instance number to assign
 * @returns New unit with instanceNumber set
 */
export function assignInstanceNumber(unit: ArmyUnit, number: number): ArmyUnit;

/**
 * Checks if a unit can be added (under 99 limit)
 * @param army - Current army state
 * @param unitId - Template ID of unit type
 * @returns true if under 99 units of this type
 */
export function canAddUnit(army: Army, unitId: string): boolean;

/**
 * Validates adding a unit with detailed error
 * @param army - Current army state
 * @param unitId - Template ID of unit type
 * @returns Validation result with optional Russian error message
 */
export function validateAddUnit(
  army: Army,
  unitId: string
): { valid: true } | { valid: false; error: string };

/**
 * Formats unit number for display
 * @param unit - Unit with optional instanceNumber
 * @param fallbackIndex - Fallback array index if no instanceNumber
 * @returns Formatted string like "#1", "#2"
 */
export function formatUnitNumber(unit: ArmyUnit, fallbackIndex?: number): string;

/**
 * Gets count badge text (null if count is 0)
 * @param count - Current count of unit type
 * @returns String to display or null to hide badge
 */
export function formatCountBadge(count: number): string | null;
```

## Types Used

```typescript
// From src/lib/types.ts
interface ArmyUnit {
  instanceId: string;
  type: 'squad' | 'machine';
  data: Squad | Machine;
  instanceNumber?: number;
  // ... other fields
}

interface Army {
  name: string;
  faction: FactionID;
  units: ArmyUnit[];
  totalCost: number;
}
```

## Error Messages (Russian)

All error messages returned by `validateAddUnit` must be in Russian:

| Condition | Message |
|-----------|---------|
| Count >= 99 | `"Максимум 99 юнитов этого типа"` |

## Implementation Notes

1. **Pure functions**: All functions should be pure (no side effects) for testability
2. **Type safety**: Use TypeScript strict mode; no `any` types
3. **Performance**: `countByUnitType` should use `reduce` for O(n) complexity
4. **Backward compatibility**: `formatUnitNumber` handles missing `instanceNumber`

## Test Coverage

Tests should be placed in `src/__tests__/unit-numbering.test.ts`:

- `countByUnitType` with empty array
- `countByUnitType` with multiple unit types
- `getNextInstanceNumber` for new type (returns 1)
- `getNextInstanceNumber` for existing type (returns count + 1)
- `canAddUnit` at limit (99 returns false)
- `canAddUnit` under limit (returns true)
- `validateAddUnit` success case
- `validateAddUnit` over limit with Russian error
- `formatUnitNumber` with instanceNumber
- `formatUnitNumber` without instanceNumber (fallback)
- `formatCountBadge` with 0 (returns null)
- `formatCountBadge` with positive number
