# Quickstart Guide: Rules Version Selection

**Feature**: Rules Version Selection
**Branch**: `002-rules-version-selection`
**Date**: 2025-01-11

## Overview

This guide provides step-by-step instructions for implementing the rules version selection feature.

---

## Prerequisites

- Node.js >= 22.16.0
- npm >= 10.0.0
- Feature branch checked out: `002-rules-version-selection`
- Spec reviewed: `specs/002-rules-version-selection/spec.md`

---

## Development Steps

### Step 1: Create Rules Registry Structure

**File**: `src/lib/rules-registry.ts`

```typescript
import { RulesVersion, RulesVersionID } from './types';
import { tehnologRules } from './rules/tehnolog';
import { panovRules } from './rules/panov';

export const rulesRegistry: Record<RulesVersionID, RulesVersion> = {
  tehnolog: tehnologRules,
  panov: panovRules,
};

export function getDefaultRulesVersion(): RulesVersionID {
  return 'tehnolog';
}

export function getRulesVersion(id: RulesVersionID): RulesVersion {
  return rulesRegistry[id];
}

export function getAllRulesVersions(): RulesVersion[] {
  return Object.values(rulesRegistry);
}

export function isValidRulesVersion(id: string): id is RulesVersionID {
  return Object.keys(rulesRegistry).includes(id);
}
```

---

### Step 2: Update Types

**File**: `src/lib/types.ts`

Add to existing types:

```typescript
// Add after existing types
export type RulesVersionID = 'tehnolog' | 'panov';

export interface RulesVersion {
  id: RulesVersionID;
  name: string;
  source: string;
  calculateHit: (rangeStr: string, distanceSteps: number) => HitResult;
  calculateDamage: (powerStr: string, targetArmor: number) => DamageResult;
  calculateMelee: (attackerMelee: number, defenderMelee: number) => MeleeResult;
}
```

---

### Step 3: Create Tehnolog Rules Implementation

**File**: `src/lib/rules/tehnolog.ts`

Extract existing logic from `game-logic.ts`:

```typescript
import { RulesVersion, HitResult, DamageResult, MeleeResult } from '../types';
import { rollDie, parseRoll } from '../game-logic';

export const tehnologRules: RulesVersion = {
  id: 'tehnolog',
  name: 'Технолог',
  source: 'docs/original/Bronepekhota_Pravila_05_08_08.pdf',

  calculateHit: (rangeStr: string, distanceSteps: number): HitResult => {
    const { total, rolls } = parseRoll(rangeStr);
    return {
      success: total >= distanceSteps,
      roll: rolls[0] || 0,
      total
    };
  },

  calculateDamage: (powerStr: string, targetArmor: number): DamageResult => {
    const { dice, sides, bonus } = parseRoll(powerStr);
    let damage = 0;
    const rolls = [];
    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);
      if (r > targetArmor) {
        damage += 1;
      }
    }
    return { damage, rolls };
  },

  calculateMelee: (attackerMelee: number, defenderMelee: number): MeleeResult => {
    const aRoll = rollDie(6);
    const dRoll = rollDie(6);
    const aTotal = aRoll + attackerMelee;
    const dTotal = dRoll + defenderMelee;

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if (aTotal > dTotal) winner = 'attacker';
    else if (dTotal > aTotal) winner = 'defender';

    return {
      attackerRoll: aRoll,
      attackerTotal: aTotal,
      defenderRoll: dRoll,
      defenderTotal: dTotal,
      winner
    };
  }
};
```

---

### Step 4: Create Panov Rules Implementation

**File**: `src/lib/rules/panov.ts`

Implement "Панов" version formulas (refer to `docs/panov/rules-originnal.pdf`):

```typescript
import { RulesVersion, HitResult, DamageResult, MeleeResult } from '../types';
import { rollDie, parseRoll } from '../game-logic';

export const panovRules: RulesVersion = {
  id: 'panov',
  name: 'Панов',
  source: 'docs/panov/rules-originnal.pdf',

  // TODO: Implement according to Panov rules PDF
  calculateHit: (rangeStr: string, distanceSteps: number): HitResult => {
    // Adjust based on Panov's rules
    const { total, rolls } = parseRoll(rangeStr);
    return {
      success: total >= distanceSteps,
      roll: rolls[0] || 0,
      total
    };
  },

  calculateDamage: (powerStr: string, targetArmor: number): DamageResult => {
    // Adjust based on Panov's rules
    const { dice, sides, bonus } = parseRoll(powerStr);
    let damage = 0;
    const rolls = [];
    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);
      if (r > targetArmor) {
        damage += 1;
      }
    }
    return { damage, rolls };
  },

  calculateMelee: (attackerMelee: number, defenderMelee: number): MeleeResult => {
    // Adjust based on Panov's rules
    const aRoll = rollDie(6);
    const dRoll = rollDie(6);
    const aTotal = aRoll + attackerMelee;
    const dTotal = dRoll + defenderMelee;

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if (aTotal > dTotal) winner = 'attacker';
    else if (dTotal > aTotal) winner = 'defender';

    return {
      attackerRoll: aRoll,
      attackerTotal: aTotal,
      defenderRoll: dRoll,
      defenderTotal: dTotal,
      winner
    };
  }
};
```

**Note**: Review the Panov PDF to identify any formula differences from the Tehnolog version and adjust accordingly.

---

### Step 5: Create RulesVersionSelector Component

**File**: `src/components/RulesVersionSelector.tsx`

```typescript
'use client';

import { RulesVersionID } from '@/lib/types';
import { rulesRegistry, getAllRulesVersions } from '@/lib/rules-registry';

interface RulesVersionSelectorProps {
  selectedVersion: RulesVersionID;
  onVersionChange: (id: RulesVersionID) => void;
}

export default function RulesVersionSelector({
  selectedVersion,
  onVersionChange
}: RulesVersionSelectorProps) {
  const versions = getAllRulesVersions();
  const currentVersion = rulesRegistry[selectedVersion];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-60 uppercase tracking-wider hidden sm:inline">
        Версия правил:
      </span>
      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value as RulesVersionID)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium min-h-[44px] min-w-[120px]"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {version.name}
          </option>
        ))}
      </select>
      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-700 text-slate-300">
        {currentVersion.name}
      </span>
    </div>
  );
}
```

---

### Step 6: Update ArmyBuilder Component

**File**: `src/components/ArmyBuilder.tsx`

Add rules version state and selector:

```typescript
// Add imports
import { useState, useEffect } from 'react';
import { RulesVersionID, rulesRegistry, isValidRulesVersion } from '@/lib/rules-registry';
import RulesVersionSelector from './RulesVersionSelector';

// Add state
const [rulesVersion, setRulesVersion] = useState<RulesVersionID>(() => {
  const saved = localStorage.getItem('bronepehota_rules_version');
  if (saved && isValidRulesVersion(saved)) {
    return saved as RulesVersionID;
  }
  return 'tehnolog';
});

// Persist to localStorage
useEffect(() => {
  localStorage.setItem('bronepehota_rules_version', rulesVersion);
}, [rulesVersion]);

// Add RulesVersionSelector to header (after faction badge)
<RulesVersionSelector
  selectedVersion={rulesVersion}
  onVersionChange={setRulesVersion}
/>
```

---

### Step 7: Remove Attack Calculator Tab from GameSession

**File**: `src/components/GameSession.tsx`

Remove the following:
- `showCombat` state
- `setShowCombat` calls
- "Атака" button from control bar
- `CombatAssistant` import
- Conditional rendering of `CombatAssistant`

```typescript
// REMOVE these lines:
const [showCombat, setShowCombat] = useState(false);
import CombatAssistant from './CombatAssistant';
// ... showCombat state usage
// ... "Атака" button
// ... {showCombat ? <CombatAssistant /> : ...}
```

---

### Step 8: Add Tests

**File**: `src/__tests__/rules-registry.test.ts`

```typescript
import { rulesRegistry, isValidRulesVersion, getDefaultRulesVersion } from '@/lib/rules-registry';

describe('Rules Registry', () => {
  test('getDefaultRulesVersion returns tehnolog', () => {
    expect(getDefaultRulesVersion()).toBe('tehnolog');
  });

  test('isValidRulesVersion validates correctly', () => {
    expect(isValidRulesVersion('tehnolog')).toBe(true);
    expect(isValidRulesVersion('panov')).toBe(true);
    expect(isValidRulesVersion('invalid')).toBe(false);
  });

  test('rulesRegistry contains all versions', () => {
    expect(Object.keys(rulesRegistry)).toEqual(['tehnolog', 'panov']);
  });

  test('each version has required functions', () => {
    Object.values(rulesRegistry).forEach((version) => {
      expect(version).toHaveProperty('calculateHit');
      expect(version).toHaveProperty('calculateDamage');
      expect(version).toHaveProperty('calculateMelee');
      expect(typeof version.calculateHit).toBe('function');
      expect(typeof version.calculateDamage).toBe('function');
      expect(typeof version.calculateMelee).toBe('function');
    });
  });
});
```

**File**: `src/__tests__/game-logic.test.ts` (update existing)

Add tests for version-specific calculations:

```typescript
import { rulesRegistry } from '@/lib/rules-registry';

describe('Version-Specific Calculations', () => {
  describe('Tehnolog version', () => {
    const tehnolog = rulesRegistry.tehnolog;

    test('calculateHit works correctly', () => {
      const result = tehnolog.calculateHit('D6+2', 5);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('total');
    });

    // Add more tests...
  });

  describe('Panov version', () => {
    const panov = rulesRegistry.panov;

    test('calculateHit works correctly', () => {
      const result = panov.calculateHit('D6+2', 5);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('total');
    });

    // Add more tests...
  });
});
```

---

### Step 9: Test Locally

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Verify in "Штаб" (builder) view:
   - Rules version selector is visible in header
   - Default is "Технолог"
   - Can switch to "Панов"
   - Selection persists on page refresh

4. Verify in "В Бой" (game) view:
   - "Атака" button is removed
   - Unit cards still have combat functionality

5. Test on mobile (use browser dev tools or actual device):
   - Selector is touch-friendly (44x44px minimum)
   - Dropdown is readable on small screens

---

### Step 10: Run Tests

```bash
npm run test
```

All tests should pass.

---

## Checklist

Before committing:

- [ ] `rules-registry.ts` created with type-safe registry
- [ ] `types.ts` updated with `RulesVersionID` and `RulesVersion` interface
- [ ] `rules/tehnolog.ts` created with extracted existing logic
- [ ] `rules/panov.ts` created with Panov-specific formulas
- [ ] `RulesVersionSelector.tsx` component created
- [ ] `ArmyBuilder.tsx` updated to include selector
- [ ] `GameSession.tsx` updated to remove "Атака" tab
- [ ] Tests added for registry and version-specific calculations
- [ ] All tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Manual testing completed on desktop and mobile
- [ ] localStorage persistence verified

---

## Troubleshooting

### Issue: TypeScript error about RulesVersionID

**Solution**: Make sure `RulesVersionID` is exported from `types.ts` and imported in all files that use it.

### Issue: localStorage not persisting

**Solution**: Check browser console for errors. Some browsers block localStorage in certain modes (e.g., incognito). The app should gracefully fall back to default.

### Issue: "Атака" button still visible

**Solution**: Ensure you removed all references: state, button, conditional rendering, and import.

---

## Adding New Rules Versions

To add a new rules version to the system, follow these steps:

### 1. Create the Rules Implementation File

**File**: `src/lib/rules/<your-version>.ts`

```typescript
import { RulesVersion, HitResult, DamageResult, MeleeResult } from '../types';
import { rollDie, parseRoll, executeRoll } from '../game-logic';

export const yourVersionRules: RulesVersion = {
  id: 'your-version',  // Must be added to RulesVersionID type
  name: 'Your Version Name',
  source: 'path/to/your/rulebook.pdf',

  calculateHit: (rangeStr: string, distanceSteps: number): HitResult => {
    const { total, rolls } = executeRoll(rangeStr);
    return {
      success: total >= distanceSteps,
      roll: rolls[0] || 0,
      total
    };
  },

  calculateDamage: (powerStr: string, targetArmor: number): DamageResult => {
    const { dice, sides, bonus } = parseRoll(powerStr);
    let damage = 0;
    const rolls = [];
    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);
      if (r > targetArmor) {
        damage += 1;
      }
    }
    return { damage, rolls };
  },

  calculateMelee: (attackerMelee: number, defenderMelee: number): MeleeResult => {
    const aRoll = rollDie(6);
    const dRoll = rollDie(6);
    const aTotal = aRoll + attackerMelee;
    const dTotal = dRoll + defenderMelee;

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if (aTotal > dTotal) winner = 'attacker';
    else if (dTotal > aTotal) winner = 'defender';

    return {
      attackerRoll: aRoll,
      attackerTotal: aTotal,
      defenderRoll: dRoll,
      defenderTotal: dTotal,
      winner
    };
  }
};
```

### 2. Update the RulesVersionID Type

**File**: `src/lib/types.ts`

Add your new version ID to the union type:

```typescript
export type RulesVersionID = 'tehnolog' | 'panov' | 'your-version';
```

### 3. Register in Rules Registry

**File**: `src/lib/rules-registry.ts`

Import and register your new version:

```typescript
import { yourVersionRules } from './rules/your-version';

export const rulesRegistry: Record<RulesVersionID, RulesVersion> = {
  tehnolog: tehnologRules,
  panov: panovRules,
  'your-version': yourVersionRules,  // Add this line
};
```

### 4. Add Tests

**File**: `src/__tests__/rules-registry.test.ts`

Add tests for your new version:

```typescript
test('your-version is registered', () => {
  expect(isValidRulesVersion('your-version')).toBe(true);
});

test('your-version has all required functions', () => {
  const version = rulesRegistry['your-version'];
  expect(version.calculateHit).toBeInstanceOf(Function);
  expect(version.calculateDamage).toBeInstanceOf(Function);
  expect(version.calculateMelee).toBeInstanceOf(Function);
});
```

### 5. Verify

Run tests and build:

```bash
npm run test
npm run build
```

Your new version should now appear in the rules selector dropdown and all calculations will use your implementation.

---

## Next Steps

After implementation:

1. Run `/speckit.tasks` to generate the task breakdown
2. Implement according to the tasks
3. Create pull request with description referencing this spec
