# Developer Quickstart: 003-Official-Rules

## Overview

This guide helps developers implement the official rules combat calculation feature. Feature 003 adds support for accurate combat calculations in both official rules (Технолог) and fan rules (Панов) editions, including fortification modifiers and vehicle durability zones.

---

## Prerequisites

1. **Node.js** 18+ and npm installed
2. **Repository cloned**: `git clone <repo-url>`
3. **Dependencies installed**: `npm install`
4. **Development server running**: `npm run dev`

---

## Project Structure

```
src/
├── lib/
│   ├── types.ts                    # UPDATE: add FortificationType, DurabilityZone
│   ├── rules-registry.ts           # UPDATE: source references to TXT files
│   ├── rules/
│   │   ├── tehnolog.ts             # UPDATE: fix calculateDamage for virtual fire
│   │   └── fan.ts                  # UPDATE: fix calculateDamage for vehicle zones
│   └── game-logic.ts               # EXISTING: shared dice parsing
├── components/
│   ├── CombatAssistant.tsx         # UPDATE: add fortification selector
│   ├── FortificationSelector.tsx   # NEW: fortification UI
│   └── RulesInfoModal.tsx          # NEW: rules information modal
└── __tests__/
    ├── game-logic.test.ts          # EXTEND: fortification tests
    ├── tehnolog-rules.test.ts      # NEW: official rules tests
    └── fan-rules.test.ts           # NEW: fan rules tests
```

---

## Step 1: Add Type Definitions

**File**: `src/lib/types.ts`

Add these definitions after the existing types:

```typescript
// Fortification types for cover mechanics
export type FortificationType = 'none' | 'light' | 'bunker' | 'heavy';

export interface FortificationModifiers {
  armor: number;     // For official rules (tehnolog)
  distance: number;  // For fan rules (panov)
}

export const FORTIFICATION_MODIFIERS: Record<FortificationType, FortificationModifiers> = {
  none: { armor: 0, distance: 0 },
  light: { armor: 1, distance: 1 },
  bunker: { armor: 2, distance: 2 },
  heavy: { armor: 3, distance: 2 } // Fan rules don't have heavy, use bunker value
};

// Durability zones for fan rules vehicle damage
export interface DurabilityZone {
  max: number;
  color: 'green' | 'yellow' | 'red';
  damagePerDie: {
    D6: number;
    D12: number;
    D20: number;
  };
}

// Update Machine interface to include optional durability zones
export interface Machine {
  // ... existing fields
  durabilityZones?: DurabilityZone[]; // Optional for fan rules
}
```

---

## Step 2: Update Official Rules Implementation

**File**: `src/lib/rules/tehnolog.ts`

1. **Update source reference**:

```typescript
export const tehnologRules: RulesVersion = {
  id: 'tehnolog',
  name: 'Технолог',
  source: 'docs/original/official_rules.txt', // Changed from PDF to TXT
  // ...
};
```

2. **Update calculateDamage for fortifications**:

```typescript
import { FortificationType, FORTIFICATION_MODIFIERS } from '../types';

export const tehnologRules: RulesVersion = {
  // ... existing fields

  calculateDamage: (
    powerStr: string,
    targetArmor: number,
    fortification: FortificationType = 'none',
    _special?: WeaponSpecial
  ): DamageResult => {
    const { dice, sides, bonus } = parseRoll(powerStr);

    // Apply fortification modifier to armor (official rules)
    const effectiveArmor = targetArmor + FORTIFICATION_MODIFIERS[fortification].armor;

    let damage = 0;
    const rolls = [];

    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);
      if (r > effectiveArmor) {
        damage += 1;
      }
    }

    return { damage, rolls };
  },

  // ... existing calculateHit, calculateMelee
};
```

---

## Step 3: Update Fan Rules Implementation

**File**: `src/lib/rules/fan.ts`

1. **Update source reference**:

```typescript
export const fanRules: RulesVersion = {
  id: 'fan',
  name: 'Фанатская Редакция',
  source: 'docs/panov/fan_rules.txt', // Changed from PDF to TXT
  // ...
};
```

2. **Update calculateHit for fortifications**:

```typescript
import { FortificationType, FORTIFICATION_MODIFIERS } from '../types';

export const fanRules: RulesVersion = {
  // ... existing fields

  calculateHit: (
    rangeStr: string,
    distanceSteps: number,
    fortification: FortificationType = 'none'
  ): HitResult => {
    // Apply fortification modifier to distance (fan rules)
    const effectiveDistance = distanceSteps + FORTIFICATION_MODIFIERS[fortification].distance;

    const { total, rolls } = executeRoll(rangeStr);
    return {
      success: total >= effectiveDistance,
      roll: rolls[0] || 0,
      total
    };
  },

  // ... existing calculateDamage, calculateMelee
};
```

3. **Add vehicle zone-based damage**:

```typescript
import { Machine, DurabilityZone } from '../types';

// Helper function to get durability zone
function getDurabilityZone(
  machine: Machine,
  currentDurability: number
): DurabilityZone {
  if (machine.durabilityZones) {
    return machine.durabilityZones.find(
      zone => currentDurability <= zone.max
    ) || machine.durabilityZones[machine.durabilityZones.length - 1];
  }

  // Default: derive from speed_sectors (3 zones)
  const max = machine.durability_max;
  const zones: DurabilityZone[] = [
    {
      max: machine.speed_sectors[0]?.max_durability || max,
      color: 'green',
      damagePerDie: { D6: 1, D12: 2, D20: 3 }
    },
    {
      max: machine.speed_sectors[1]?.max_durability || Math.floor(max * 2/3),
      color: 'yellow',
      damagePerDie: { D6: 1, D12: 2, D20: 3 }
    },
    {
      max: machine.speed_sectors[2]?.max_durability || Math.floor(max / 3),
      color: 'red',
      damagePerDie: { D6: 1, D12: 2, D20: 3 }
    }
  ];

  return zones.find(zone => currentDurability <= zone.max) || zones[2];
}

// Update calculateDamage for vehicle attacks
calculateDamage: (
  powerStr: string,
  targetArmor: number,
  _fortification: FortificationType = 'none',
  isVehicle?: boolean,
  currentDurability?: number,
  durabilityMax?: number,
  vehicleData?: Machine
): DamageResult => {
  const { dice, sides, bonus } = parseRoll(powerStr);
  let damage = 0;
  const rolls = [];

  // Vehicle attack uses zone-based damage (fan rules)
  if (isVehicle && vehicleData && currentDurability !== undefined) {
    const zone = getDurabilityZone(vehicleData, currentDurability);
    const zoneMax = zone.max;

    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);

      // Check if die penetrates zone
      if (r > zoneMax) {
        // Add damage based on die type
        if (sides === 6) damage += 1;
        else if (sides === 12) damage += 2;
        else if (sides === 20) damage += 3;
      }
    }
  } else {
    // Infantry attack uses standard calculation
    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);
      if (r > targetArmor) {
        damage += 1;
      }
    }
  }

  // ... existing special effects handling

  return { damage, rolls };
},
```

---

## Step 4: Create FortificationSelector Component

**File**: `src/components/FortificationSelector.tsx`

```typescript
'use client';

import { FortificationType, FORTIFICATION_MODIFIERS, RulesVersionID } from '@/lib/types';
import { clsx } from 'clsx';
import { useFactionColor } from '@/hooks/useFactionColor'; // Assuming hook exists

interface FortificationSelectorProps {
  value: FortificationType;
  onChange: (value: FortificationType) => void;
  rulesVersion: RulesVersionID;
  className?: string;
}

const OPTIONS: Record<FortificationType, { label: string; modifier: string }> = {
  none: { label: 'Без укрытия', modifier: '+0' },
  light: { label: 'Лёгкое', modifier: '+1' },
  bunker: { label: 'Бункер', modifier: '+2' },
  heavy: { label: 'Бункер+', modifier: '+3' },
};

export function FortificationSelector({
  value,
  onChange,
  rulesVersion,
  className = ''
}: FortificationSelectorProps) {
  const factionColor = useFactionColor();

  const getModifierText = (type: FortificationType) => {
    const mod = FORTIFICATION_MODIFIERS[type];
    if (rulesVersion === 'tehnolog') {
      return `(${mod.armor > 0 ? `+${mod.armor}` : mod.armor} к броне)`;
    } else {
      return `(${mod.distance > 0 ? `+${mod.distance}` : mod.distance} к дистанции)`;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Укрытие цели"
      className={clsx('flex gap-2 overflow-x-auto pb-2', className)}
    >
      {(Object.entries(OPTIONS) as [FortificationType, typeof OPTIONS.none][]).map(
        ([type, opt]) => {
          const isSelected = value === type;
          return (
            <button
              key={type}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${opt.label} ${getModifierText(type)}`}
              className={clsx(
                'flex-shrink-0 px-4 py-3 rounded-full text-sm font-medium',
                'transition-all duration-200 min-h-[44px]',
                isSelected
                  ? `bg-${factionColor}-600 text-white`
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
              onClick={() => onChange(type)}
            >
              {opt.label}
            </button>
          );
        }
      )}
    </div>
  );
}
```

---

## Step 5: Create RulesInfoModal Component

**File**: `src/components/RulesInfoModal.tsx`

```typescript
'use client';

import { RulesVersionID } from '@/lib/types';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface RulesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesVersion: RulesVersionID;
}

const TEHNOLOG_CONTENT = (
  <>
    <h3 className="font-semibold mb-2">Официальные правила (Технолог)</h3>
    <p className="mb-2"><strong>Попадание</strong>: Бросок кубика дальности >= расстоянию до цели</p>
    <p className="mb-2"><strong>Урон по пехоте</strong>: Каждый кубик > брони цели = 1 ранение</p>
    <p className="mb-4"><strong>Урон по технике</strong>: Каждый кубик > брони = 1 повреждение</p>

    <h4 className="font-semibold mb-2">Укрепления</h4>
    <ul className="list-disc pl-5 mb-4 space-y-1">
      <li>Без укрытия: +0 к броне</li>
      <li>Лёгкое (окопы): +1 к брони</li>
      <li>Бункер: +2 к брони</li>
      <li>Бункер+: +3 к брони</li>
    </ul>

    <p className="text-sm text-slate-400 italic">Источник: docs/original/official_rules.txt, раздел 7</p>
  </>
);

const FAN_CONTENT = (
  <>
    <h3 className="font-semibold mb-2">Фанатские правила (Панов)</h3>
    <p className="mb-2"><strong>Попадание</strong>: Бросок кубика дальности >= расстоянию до цели</p>
    <p className="mb-2"><strong>Урон по пехоте</strong>: Каждый кубик > брони цели = 1 ранение</p>
    <p className="mb-4"><strong>Урон по технике</strong>: Сравнение с зоной прочности<br />
      <span className="text-sm">D6 = 1 урон, D12 = 2 урона, D20 = 3 урона при пробитии</span></p>

    <h4 className="font-semibold mb-2">Укрепления</h4>
    <ul className="list-disc pl-5 mb-4 space-y-1">
      <li>Без укрытия: +0 к дистанции</li>
      <li>Лёгкое укрытие: +1 к дистанции</li>
      <li>Полное укрытие (бункер): +2 к дистанции</li>
    </ul>

    <p className="text-sm text-slate-400 italic">Источник: docs/panov/fan_rules.txt, раздел 7</p>
  </>
);

export function RulesInfoModal({ isOpen, onClose, rulesVersion }: RulesInfoModalProps) {
  if (!isOpen) return null;

  const content = rulesVersion === 'tehnolog' ? TEHNOLOG_CONTENT : FAN_CONTENT;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative glass-strong rounded-2xl p-6 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold">Правила расчёта боя</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Update CombatAssistant Component

**File**: `src/components/CombatAssistant.tsx`

Add fortification state and selector:

```typescript
import { useState } from 'react';
import { FortificationSelector } from './FortificationSelector';
import { RulesInfoModal } from './RulesInfoModal';
import { Info } from 'lucide-react';
import { FortificationType } from '@/lib/types';

export function CombatAssistant({ /* existing props */ }) {
  // ... existing state

  // New state for fortifications and info modal
  const [fortification, setFortification] = useState<FortificationType>('none');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Update hit calculation to include fortification
  const hitResult = calculateHit(range, distance, fortification);

  // Update damage calculation to include fortification
  const damageResult = calculateDamage(
    power,
    armor,
    fortification,
    isVehicle,
    currentDurability,
    durabilityMax
  );

  return (
    <div className="combat-modal">
      {/* Header with info button */}
      <div className="flex justify-between items-center mb-4">
        <h2>Атака</h2>
        <button
          onClick={() => setIsInfoOpen(true)}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          aria-label="Информация о правилах"
        >
          <Info className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Fortification selector */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Укрытие цели</label>
        <FortificationSelector
          value={fortification}
          onChange={setFortification}
          rulesVersion={rulesVersion}
        />
      </div>

      {/* Existing attack calculation UI */}

      {/* Info modal */}
      <RulesInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        rulesVersion={rulesVersion}
      />
    </div>
  );
}
```

---

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tehnolog-rules.test.ts
```

### Test Coverage

```bash
npm test -- --coverage
```

---

## Development Workflow

### 1. Make Changes

Edit the relevant files based on your task.

### 2. Run Tests

```bash
npm test -- --watch
```

### 3. Test Manually

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Test the following:
# - Select different rules versions
# - Test fortification selection
# - Open rules info modal
# - Run attack calculations with different settings
```

### 4. Lint

```bash
npm run lint
```

### 5. Type Check

```bash
npx tsc --noEmit
```

---

## Common Issues

### Issue: Fortification modifier not applying

**Solution**: Check that:
1. `FORTIFICATION_MODIFIERS` is imported in rules module
2. Fortification parameter is passed to `calculateHit`/`calculateDamage`
3. Correct modifier field is used (`.armor` for official, `.distance` for fan)

### Issue: Vehicle zone calculation incorrect

**Solution**: Check that:
1. `durabilityZones` is defined in machine data (or derived from `speed_sectors`)
2. `currentDurability` is passed correctly to damage function
3. Zone comparison uses `>` (not `>=`)

### Issue: TypeScript errors after adding types

**Solution**: Run `npx tsc --noEmit` to see full error messages. Common fixes:
1. Import new types at top of file
2. Update function signatures to include new parameters
3. Add default values for optional parameters

---

## Additional Resources

- **Feature Spec**: `specs/003-official-rules/spec.md`
- **Research**: `specs/003-official-rules/research.md`
- **Data Model**: `specs/003-official-rules/design/data-model.md`
- **Contracts**: `specs/003-official-rules/design/contracts/`
- **Reference Docs**:
  - `docs/original/official_rules.txt` (Official rules)
  - `docs/panov/fan_rules.txt` (Fan rules)

---

## Next Steps

After completing implementation:

1. Create PR with description of changes
2. Request review from team
3. Test on mobile device
4. Update documentation if needed
5. Merge to main branch
