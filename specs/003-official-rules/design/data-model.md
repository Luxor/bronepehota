# Data Model: 003-Official-Rules

## Entity: RulesVersion

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | string | Version identifier (`tehnolog` or `fan`) | Must be 'tehnolog' or 'fan' |
| `name` | string | Display name (Russian) | Non-empty |
| `description` | string | Description of rules edition | Non-empty |

**Relationships**: None (enum-like, no external references)

---

## Entity: RulesEngine (Runtime)

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `version` | RulesVersionID | Current rules edition | Must be 'tehnolog' or 'fan' |
| `diceSides` | number | Number of sides on dice (6 or 12) | Must be 6 or 12 |
| `combatRules` | RulesEngineCombat | Combat rule set | Must match version |
| `movementRules` | RulesEngineMovement | Movement rule set | Must match version |
| `weaponRules` | RulesEngineWeapon | Weapon rule set | Must match version |

**Relationships**: One RulesEngine active per game session

---

## Entity: RulesEngineCombat

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `hitCheck` | function | Function to calculate hit probability | Returns 0-1 |
| `damageCalc` | function | Function to calculate damage | Returns integer |
| `meleeResolve` | function | Function to resolve melee combat | Returns combat result |

**Version-specific implementations**:
- **tehnolog**: D12-based hit checks, standard damage calculation
- **fan**: D6-based hit checks (reduced ranges), modified damage

---

## Entity: RulesEngineMovement

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `speedSectors` | function | Function to calculate speed sectors | Returns sector list |
| `movementCost` | function | Function to calculate movement cost | Returns AP cost |

**Version-specific implementations**:
- **tehnolog**: Standard speed sector calculation
- **fan**: Modified speed sector values (different terrain costs)

---

## Entity: RulesEngineWeapon

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `rangeModifier` | function | Function to apply range modifiers | Returns modified range |
| `weaponEffect` | function | Function to resolve weapon effects | Returns effect result |

**Version-specific implementations**:
- **tehnolog**: Standard weapon ranges
- **fan**: D6-based ranges (shorter effective ranges)

---

## Entity: RollResult

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `dice` | number | Number of dice rolled | ≥ 1 |
| `sides` | number | Number of sides on dice | 6 or 12 |
| `rolls` | number[] | Individual roll results | Each in [1, sides] |
| `total` | number | Sum of rolls + bonuses | Integer |

**Derived from**: `executeRoll()` function in `game-logic.ts`

---

## Entity: HitCheckResult

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `success` | boolean | Whether hit was successful | boolean |
| `diceNeeded` | number | Minimum dice roll to hit | Integer in [1, sides] |
| `actualRoll` | number | Actual dice roll | Integer in [1, sides] |
| `isCrit` | boolean | Whether critical hit occurred | boolean |

**Version-specific**:
- **tehnolog**: `isCrit` = true when roll ≤ 2 on D12
- **fan**: `isCrit` = true when roll ≤ 1 on D6

---

## Entity: DamageResult

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `damage` | number | Amount of damage dealt | ≥ 0 |
| `armorPierced` | boolean | Whether armor was pierced | boolean |
| `isCrit` | boolean | Whether critical damage occurred | boolean |

**Version-specific**:
- **tehnolog**: Standard damage calculation
- **fan**: Modified damage values based on D6 rolls

---

## Version-Specific Data Structures

### Tehnolog Rules Structure

```typescript
interface TehnogRules {
  diceSides: 12;
  criticalThreshold: 2;  // 1 or 2 on D12
  hitThresholds: {
    short: 3;   // Easy targets
    medium: 6;  // Normal targets
    long: 9;    // Hard targets
  };
}
```

### Fan Rules Structure

```typescript
interface FanRules {
  diceSides: 6;
  criticalThreshold: 1;  // 1 on D6
  hitThresholds: {
    short: 2;   // Easy targets
    medium: 4;  // Normal targets
    long: 6;    // Hard targets
  };
}
```

---

## State Transitions

### RulesVersion Selection

```
[No Version Selected] → [User selects version] → [Version Active]
[Version Active] → [User changes version] → [New Version Active]
```

**Persistence**: Rules version stored in `localStorage` key `bronepehota_rules_version`

### Combat Flow (per rules version)

```
[Select Attacker] → [Select Target] → [Execute Hit Check] → [Calculate Damage]
```

Each step uses version-specific RulesEngine methods.

---

## External Data Dependencies

### Source Files

| File | Purpose | Format |
|------|---------|--------|
| `docs/original/official_rules.txt` | Official rules reference | Plain text |
| `docs/panov/fan_rules.txt` | Fan rules reference | Plain text |
| `factions.json` | Faction definitions | JSON |
| `squads.json` | Squad definitions | JSON |
| `machines.json` | Machine definitions | JSON |

### Runtime State

| Key | Purpose | Type |
|-----|---------|------|
| `bronepehota_army` | Army state | localStorage (stringified JSON) |
| `bronepehota_rules_version` | Selected rules version | localStorage (string) |

---

## Constraints

1. **Rules Version Scope**: The two rules editions (tehnolog, fan) represent fundamental changes to game mechanics:
   - Different dice types (D12 vs D6)
   - Different critical thresholds
   - Different hit calculation algorithms
   - Different damage formulas

2. **Backward Compatibility**: Existing army data (`bronepehota_army`) MUST remain compatible across rules versions. The rules version affects ONLY runtime calculations, not data structure.

3. **No Data Migration Required**: Switching between rules versions does NOT require data migration.

4. **Critical Paths**:
   - All combat calculations MUST respect the selected rules version
   - UI MUST indicate which rules version is active
   - User MUST be able to switch versions without losing army state
