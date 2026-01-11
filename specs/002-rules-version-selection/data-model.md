# Data Model: Rules Version Selection

**Feature**: Rules Version Selection
**Date**: 2025-01-11
**Status**: Complete

## Overview

This document defines the data structures, types, and state management for the rules version selection feature.

---

## Core Types

### RulesVersionID

Union type of all valid rules version identifiers.

```typescript
// src/lib/types.ts
export type RulesVersionID = 'tehnolog' | 'panov';
```

**Constraints**:
- Must be a string literal union for TypeScript exhaustiveness checking
- Each value must be a valid key in `rulesRegistry`
- New versions are added by extending this type

### RulesVersion

Interface defining a complete rules version implementation.

```typescript
// src/lib/types.ts
export interface RulesVersion {
  id: RulesVersionID;
  name: string;              // Display name in Russian (e.g., "Технолог", "Панов")
  source: string;            // Reference to PDF document
  calculateHit: CalculateHitFn;
  calculateDamage: CalculateDamageFn;
  calculateMelee: CalculateMeleeFn;
}

// Function signatures
type CalculateHitFn = (
  rangeStr: string,
  distanceSteps: number
) => HitResult;

type CalculateDamageFn = (
  powerStr: string,
  targetArmor: number
) => DamageResult;

type CalculateMeleeFn = (
  attackerMelee: number,
  defenderMelee: number
) => MeleeResult;
```

**Validation Rules**:
- `id` must match a `RulesVersionID` value
- `name` must be non-empty Russian text
- `source` must be a valid PDF filename or reference
- All calculation functions must be pure (no side effects)

---

## Result Types

### HitResult

Result of a hit chance calculation.

```typescript
export interface HitResult {
  success: boolean;    // Whether the attack hit the target
  roll: number;        // The dice roll value (first die if multiple)
  total: number;       // Final modified roll value (roll + bonus)
}
```

### DamageResult

Result of a damage calculation.

```typescript
export interface DamageResult {
  damage: number;      // Number of damage points inflicted
  rolls: number[];     // Array of individual dice rolls
}
```

### MeleeResult

Result of a melee combat calculation.

```typescript
export interface MeleeResult {
  attackerRoll: number;       // Attacker's dice roll
  attackerTotal: number;      // Attacker's modified total (roll + melee stat)
  defenderRoll: number;       // Defender's dice roll
  defenderTotal: number;      // Defender's modified total (roll + melee stat)
  winner: 'attacker' | 'defender' | 'draw';
}
```

---

## State Management

### Component State (RulesVersionSelector)

```typescript
interface RulesVersionSelectorProps {
  selectedVersion: RulesVersionID;
  onVersionChange: (id: RulesVersionID) => void;
}

// No internal state needed - controlled component
```

### Component State (ArmyBuilder)

```typescript
// Add to existing ArmyBuilder component
const [rulesVersion, setRulesVersion] = useState<RulesVersionID>(() => {
  // Initialize from localStorage or default
  const saved = localStorage.getItem('bronepehota_rules_version');
  if (saved && isValidRulesVersion(saved)) {
    return saved as RulesVersionID;
  }
  return 'tehnolog'; // Default
});

// Persist changes
useEffect(() => {
  localStorage.setItem('bronepehota_rules_version', rulesVersion);
}, [rulesVersion]);
```

### localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `bronepehota_rules_version` | `string` | Current rules version ID (e.g., "tehnolog", "panov") |

**Validation**:
- On read: Check if value exists in `rulesRegistry`, fall back to 'tehnolog' if invalid
- On write: Only allow valid `RulesVersionID` values
- On corruption: Silently default to 'tehnolog' (per clarification)

---

## Registry Configuration

### rulesRegistry Structure

```typescript
// src/lib/rules-registry.ts
import { RulesVersion, RulesVersionID } from './types';

export const rulesRegistry: Record<RulesVersionID, RulesVersion> = {
  tehnolog: {
    id: 'tehnolog',
    name: 'Технолог',
    source: 'docs/original/Bronepekhota_Pravila_05_08_08.pdf',
    calculateHit: (rangeStr, distanceSteps) => { /* ... */ },
    calculateDamage: (powerStr, targetArmor) => { /* ... */ },
    calculateMelee: (attackerMelee, defenderMelee) => { /* ... */ },
  },
  panov: {
    id: 'panov',
    name: 'Панов',
    source: 'docs/panov/rules-originnal.pdf',
    calculateHit: (rangeStr, distanceSteps) => { /* ... */ },
    calculateDamage: (powerStr, targetArmor) => { /* ... */ },
    calculateMelee: (attackerMelee, defenderMelee) => { /* ... */ },
  },
};
```

### Registry Functions

```typescript
// Get default rules version
export function getDefaultRulesVersion(): RulesVersionID {
  return 'tehnolog';
}

// Get rules version object by ID
export function getRulesVersion(id: RulesVersionID): RulesVersion {
  return rulesRegistry[id];
}

// Get all available rules versions
export function getAllRulesVersions(): RulesVersion[] {
  return Object.values(rulesRegistry);
}

// Validate if a string is a valid rules version ID
export function isValidRulesVersion(id: string): id is RulesVersionID {
  return Object.keys(rulesRegistry).includes(id);
}
```

---

## State Transitions

### Rules Version Selection Flow

```
┌─────────────────────┐
│   Application Load  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Read localStorage   │
│ (bronepehota_rules_ │
│    version)         │
└──────────┬──────────┘
           │
           ▼
      ┌─────────┐
      │ Valid?  │
      └────┬────┘
           │
     ┌─────┴─────┐
     │           │
    Yes          No
     │           │
     ▼           ▼
┌─────────┐  ┌──────────┐
│ Use     │  │ Default  │
│ saved   │  │ tehnolog │
│ value   │  │ (silent) │
└────┬────┘  └──────────┘
     │
     ▼
┌─────────────────────┐
│ Render Selector with│
│ current selection   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User selects new    │
│ version (optional)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update React state  │
│ + localStorage      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Combat calculations │
│ use new version     │
└─────────────────────┘
```

### Error Recovery

| Scenario | Behavior |
|----------|----------|
| localStorage key missing | Use default 'tehnolog' silently |
| Invalid value in localStorage | Use default 'tehnolog' silently |
| localStorage read error (quota/full) | Use default 'tehnolog', log error to console |
| localStorage write error | Continue with selected version in memory, log error |

---

## Relationships

### RulesVersion → Calculation Functions

Each `RulesVersion` aggregates three pure calculation functions. No shared state between versions.

```
RulesVersion
├── calculateHit(rangeStr, distanceSteps) → HitResult
├── calculateDamage(powerStr, targetArmor) → DamageResult
└── calculateMelee(attackerMelee, defenderMelee) → MeleeResult
```

### Component → Registry

Components access rules through the registry, never directly:

```
ArmyBuilder
└── rulesRegistry (import)
    └── getRulesVersion(id) → RulesVersion
        └── version.calculateHit() → HitResult
```

### localStorage ↔ React State

Bidirectional synchronization:

```
localStorage ←→ useState<RulesVersionID>
```

- On mount: Read localStorage → initialize state
- On change: Update state → write to localStorage

---

## Validation Summary

| Entity | Validation Method | Location |
|--------|-------------------|----------|
| `RulesVersionID` | TypeScript literal union | Compile-time |
| `RulesVersion` interface | TypeScript type checking | Compile-time |
| localStorage value | `isValidRulesVersion()` | Runtime (on read) |
| Calculation inputs | Function parameter types | Compile-time + runtime dice parsing |
| Calculation outputs | Return type annotations | Compile-time |

---

## Future Extensions

Adding a new rules version requires:

1. **Extend type** in `src/lib/types.ts`:
   ```typescript
   export type RulesVersionID = 'tehnolog' | 'panov' | 'newVersion';
   ```

2. **Create implementation** in `src/lib/rules/new-version.ts`:
   ```typescript
   export const newVersionRules: RulesVersion = { /* ... */ };
   ```

3. **Register** in `src/lib/rules-registry.ts`:
   ```typescript
   import { newVersionRules } from './rules/new-version';
   export const rulesRegistry = { /* ... */, newVersion: newVersionRules };
   ```

4. **Update tests** to include new version calculations
