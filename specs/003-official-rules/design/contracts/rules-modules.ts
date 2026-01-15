# Function Contracts: Rules Modules

## Overview

This document defines the TypeScript function contracts for rules modules in `src/lib/rules/`. Each rules module (tehnolog, fan) MUST export a `RulesVersion` object with these functions.

---

## Core Type Definitions

```typescript
// From src/lib/types.ts
export interface HitResult {
  success: boolean;
  roll: number;
  total: number;
}

export interface DamageResult {
  damage: number;
  rolls: number[];
  special?: {
    type: 'aoe' | 'repair' | 'burst';
    description: string;
    additionalDamage?: number;
    targets?: string[];
  };
}

export interface MeleeResult {
  attackerRoll: number;
  attackerTotal: number;
  defenderRoll: number;
  defenderTotal: number;
  winner: 'attacker' | 'defender' | 'draw';
}

export type CalculateHitFn = (rangeStr: string, distanceSteps: number, fortification?: FortificationType) => HitResult;
export type CalculateDamageFn = (powerStr: string, targetArmor: number, fortification?: FortificationType, isVehicle?: boolean, currentDurability?: number, durabilityMax?: number) => DamageResult;
export type CalculateMeleeFn = (attackerMelee: number, defenderMelee: number) => MeleeResult;

export interface RulesVersion {
  id: RulesVersionID;
  name: string;
  source: string;
  calculateHit: CalculateHitFn;
  calculateDamage: CalculateDamageFn;
  calculateMelee: CalculateMeleeFn;
  supportsSpecialEffects: boolean;
}
```

---

## Contract: calculateHit (Official Rules)

**Module**: `src/lib/rules/tehnolog.ts`

**Function Signature**:
```typescript
calculateHit: (rangeStr: string, distanceSteps: number, fortification?: FortificationType) => HitResult
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `rangeStr` | string | Dice notation for range (e.g., "D6", "D12+2", "ББ") |
| `distanceSteps` | number | Distance to target in steps (1-10) |
| `fortification` | FortificationType | Optional: Target's cover type |

**Returns**: `HitResult`
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | True if roll+bonus >= distanceSteps |
| `roll` | number | The die roll result (without bonus) |
| `total` | number | roll + bonus (if any) |

**Algorithm**:
1. Parse `rangeStr` into `{ dice, sides, bonus }`
2. If `rangeStr` === "ББ" (melee), return `{ success: true, roll: 0, total: 0 }`
3. Roll `dice` x `sides` die, apply `bonus`
4. Compare `total` to `distanceSteps`: `success = total >= distanceSteps`
5. Return result

**Fortification Handling**: Official rules do NOT apply fortification modifiers to hit calculation. Fortifications affect damage, not hit chance.

**Examples**:
```typescript
// Hit at range 2 with D6
calculateHit("D6", 2) // { success: true, roll: 4, total: 4 } (if rolled 4)
calculateHit("D6", 5) // { success: false, roll: 3, total: 3 } (if rolled 3)

// Hit with bonus
calculateHit("D6+2", 4) // { success: true, roll: 2, total: 4 } (2+2=4)

// Melee (always hits)
calculateHit("ББ", 1) // { success: true, roll: 0, total: 0 }
```

---

## Contract: calculateHit (Fan Rules)

**Module**: `src/lib/rules/fan.ts`

**Function Signature**:
```typescript
calculateHit: (rangeStr: string, distanceSteps: number, fortification?: FortificationType) => HitResult
```

**Parameters**: Same as official rules

**Returns**: Same as official rules

**Algorithm**: Same as official rules (direct comparison)

**Fortification Handling**: Fan rules apply fortification modifiers to distance:
- `none`: distanceSteps unchanged
- `light`: distanceSteps += 1
- `bunker`: distanceSteps += 2
- `heavy`: distanceSteps += 2 (same as bunker)

**Examples**:
```typescript
// Target in light cover at actual distance 3
calculateHit("D6", 3, "light") // Compares roll to distance 4 (3+1)

// Target in bunker at actual distance 5
calculateHit("D12", 5, "bunker") // Compares roll to distance 7 (5+2)
```

---

## Contract: calculateDamage (Official Rules)

**Module**: `src/lib/rules/tehnolog.ts`

**Function Signature**:
```typescript
calculateDamage: (powerStr: string, targetArmor: number, fortification?: FortificationType, isVehicle?: boolean, currentDurability?: number, durabilityMax?: number) => DamageResult
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `powerStr` | string | Dice notation for power (e.g., "1D6", "2D12") |
| `targetArmor` | number | Base armor value of target |
| `fortification` | FortificationType | Optional: Target's cover type |
| `isVehicle` | boolean | Optional: True if target is a vehicle |
| `currentDurability` | number | Optional: Current durability (for vehicles) |
| `durabilityMax` | number | Optional: Max durability (for vehicles) |

**Returns**: `DamageResult`
| Field | Type | Description |
|-------|------|-------------|
| `damage` | number | Total damage dealt |
| `rolls` | number[] | Individual die results (with bonus) |
| `special` | object | undefined (official rules don't use special effects) |

**Algorithm**:
1. Parse `powerStr` into `{ dice, sides, bonus }`
2. Apply fortification modifier to effective armor:
   - `none`: effectiveArmor = targetArmor
   - `light`: effectiveArmor = targetArmor + 1
   - `bunker`: effectiveArmor = targetArmor + 2
   - `heavy`: effectiveArmor = targetArmor + 3
3. For each die:
   - Roll `sides` die, add `bonus`
   - If result > effectiveArmor, increment damage
4. Return `{ damage, rolls }`

**Vehicle Handling**: Same as infantry (each die > armor = 1 damage). No zone-based calculation.

**Examples**:
```typescript
// 2D6 vs armor 2, no cover
calculateDamage("2D6", 2) // { damage: 1, rolls: [3, 1] } (only 3>2)

// 2D6 vs armor 2, light cover (effective armor 3)
calculateDamage("2D6", 2, "light") // { damage: 0, rolls: [3, 2] } (neither >3)

// D12 vs armor 4, bunker (effective armor 6)
calculateDamage("D12", 4, "bunker") // { damage: 1, rolls: [8] } (8>6)
```

---

## Contract: calculateDamage (Fan Rules)

**Module**: `src/lib/rules/fan.ts`

**Function Signature**:
```typescript
calculateDamage: (powerStr: string, targetArmor: number, fortification?: FortificationType, isVehicle?: boolean, currentDurability?: number, durabilityMax?: number) => DamageResult
```

**Parameters**: Same as official rules

**Returns**: Same as official rules (with optional `special` for AoE/repair/burst)

**Algorithm for Infantry**:
1. Same as official rules (each die > armor = 1 wound)
2. No fortification modifier to armor

**Algorithm for Vehicles**:
1. Determine durability zone based on `currentDurability`:
   - Green zone: `currentDurability > durabilityMax * 2/3`
   - Yellow zone: `currentDurability > durabilityMax * 1/3`
   - Red zone: `currentDurability <= durabilityMax * 1/3`
2. Get zone max value (upper bound of current zone)
3. For each die:
   - Roll `sides` die, add `bonus`
   - If result > zone max, add damage based on die type:
     - D6: +1 damage
     - D12: +2 damage
     - D20: +3 damage
4. Return `{ damage, rolls }`

**Fortification Handling**: Fan rules do NOT apply fortification modifiers to damage against vehicles. Fortifications affect hit calculation only.

**Examples**:
```typescript
// Infantry: 2D6 vs armor 2
calculateDamage("2D6", 2, undefined, false) // { damage: 1, rolls: [3, 1] }

// Vehicle with durability 9, current 7 (green zone, max 9)
// 2D12 attack - green zone max is 9
calculateDamage("2D12", 0, undefined, true, 7, 9)
// Rolls: [5, 11] -> 5 doesn't penetrate (5<=9), 11 penetrates (11>9) for 2 damage
// Result: { damage: 2, rolls: [5, 11] }

// Vehicle with durability 9, current 4 (red zone, max 3)
// 2D12 attack - red zone max is 3
calculateDamage("2D12", 0, undefined, true, 4, 9)
// Rolls: [5, 8] -> both penetrate (5>3, 8>3) for 4 damage total (2+2)
// Result: { damage: 4, rolls: [5, 8] }
```

---

## Contract: calculateMelee (Both Rules)

**Module**: `src/lib/rules/tehnolog.ts` and `src/lib/rules/fan.ts`

**Function Signature**:
```typescript
calculateMelee: (attackerMelee: number, defenderMelee: number) => MeleeResult
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `attackerMelee` | number | Attacker's ББ (melee skill) |
| `defenderMelee` | number | Defender's ББ (melee skill) |

**Returns**: `MeleeResult`
| Field | Type | Description |
|-------|------|-------------|
| `attackerRoll` | number | Attacker's D6 roll |
| `attackerTotal` | number | attackerRoll + attackerMelee |
| `defenderRoll` | number | Defender's D6 roll |
| `defenderTotal` | number | defenderRoll + defenderMelee |
| `winner` | 'attacker' | 'defender' | 'draw' | Combat result |

**Algorithm** (identical for both rules editions):
1. Attacker rolls D6, adds attackerMelee → attackerTotal
2. Defender rolls D6, adds defenderMelee → defenderTotal
3. Compare totals:
   - attackerTotal > defenderTotal → winner = 'attacker'
   - defenderTotal > attackerTotal → winner = 'defender'
   - Equal totals → winner = 'draw'
4. Return result

**Damage Calculation**: NOT part of this function. Caller calculates damage as:
- Damage = winner's total - loser's total
- Applied to loser's wounds (infantry) or durability (vehicle)

**Examples**:
```typescript
// Attacker ББ 3 vs Defender ББ 2
calculateMelee(3, 2)
// Possible result: { attackerRoll: 4, attackerTotal: 7, defenderRoll: 3, defenderTotal: 5, winner: 'attacker' }
// Damage = 7 - 5 = 2

// Equal skills, equal rolls
calculateMelee(2, 2)
// Possible result: { attackerRoll: 3, attackerTotal: 5, defenderRoll: 3, defenderTotal: 5, winner: 'draw' }
// Damage = 0, reroll required
```

---

## Contract: RulesVersion Object

Each rules module MUST export a `RulesVersion` object:

```typescript
export const tehnologRules: RulesVersion = {
  id: 'tehnolog',
  name: 'Технолог',
  source: 'docs/original/official_rules.txt',
  supportsSpecialEffects: false,
  calculateHit: (rangeStr, distanceSteps, fortification?) => HitResult,
  calculateDamage: (powerStr, targetArmor, fortification?, isVehicle?, currentDurability?, durabilityMax?) => DamageResult,
  calculateMelee: (attackerMelee, defenderMelee) => MeleeResult
};

export const fanRules: RulesVersion = {
  id: 'fan',
  name: 'Фанатская Редакция',
  source: 'docs/panov/fan_rules.txt',
  supportsSpecialEffects: true,
  calculateHit: (rangeStr, distanceSteps, fortification?) => HitResult,
  calculateDamage: (powerStr, targetArmor, fortification?, isVehicle?, currentDurability?, durabilityMax?) => DamageResult,
  calculateMelee: (attackerMelee, defenderMelee) => MeleeResult
};
```

---

## Version Registry

`src/lib/rules-registry.ts` MUST provide:

```typescript
export const rulesRegistry: Record<RulesVersionID, RulesVersion> = {
  tehnolog: tehnologRules,
  fan: fanRules,
};

export function getDefaultRulesVersion(): RulesVersionID; // Returns 'tehnolog'
export function getRulesVersion(id: RulesVersionID): RulesVersion;
export function getAllRulesVersions(): RulesVersion[];
export function isValidRulesVersion(id: string): id is RulesVersionID;
```
