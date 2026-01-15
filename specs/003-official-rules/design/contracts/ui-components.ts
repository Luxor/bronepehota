# UI Component Contracts: Fortification Selection & Rules Info

## Overview

This document defines the React component contracts for new UI components: fortification selector and rules information modal.

---

## Component: FortificationSelector

**Location**: `src/components/FortificationSelector.tsx`

### Props Interface

```typescript
interface FortificationSelectorProps {
  value: FortificationType;
  onChange: (value: FortificationType) => void;
  rulesVersion: RulesVersionID;
  className?: string;
}

type FortificationType = 'none' | 'light' | 'bunker' | 'heavy';
type RulesVersionID = 'tehnolog' | 'fan';
```

### Props Description

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | FortificationType | Yes | Currently selected fortification type |
| `onChange` | function | Yes | Callback when selection changes |
| `rulesVersion` | RulesVersionID | Yes | Current rules edition (affects labels) |
| `className` | string | No | Additional CSS classes |

### Behavior

1. **Rendering**: Display 4 buttons in a horizontal row
2. **Active State**: Selected button has faction-colored background
3. **Inactive State**: Unselected buttons have slate-700 background
4. **Accessibility**:
   - Role: `radiogroup`
   - Each button: `role="radio"`, `aria-checked`, `aria-label`
5. **Responsive**: Horizontal scroll if needed on mobile
6. **Touch**: 44px minimum height, single-tap selection

### Labels

**Official Rules (tehnolog)**:
- `none`: "Без укрытия" (+0 к броне)
- `light`: "Окопы" (+1 к броне)
- `bunker`: "Бункер" (+2 к брони)
- `heavy`: "Бункер+" (+3 к брони)

**Fan Rules (panov)**:
- `none`: "Без укрытия" (+0 к дистанции)
- `light`: "Лёгкое укрытие" (+1 к дистанции)
- `bunker`: "Бункер" (+2 к дистанции)
- `heavy`: "Бункер" (+2 к дистанции, same as bunker)

### Visual Specification

```tsx
<div className="flex gap-2 overflow-x-auto pb-2">
  {options.map(opt => (
    <button
      role="radio"
      aria-checked={isSelected}
      aria-label={opt.label}
      className={clsx(
        "flex-shrink-0 px-4 py-3 rounded-full text-sm font-medium",
        "transition-all duration-200",
        "min-h-[44px]", // Touch target
        isSelected ? factionBgClasses : "bg-slate-700 text-slate-300"
      )}
      onClick={() => onChange(opt.value)}
    >
      {opt.label}
    </button>
  ))}
</div>
```

### Examples

```tsx
// Basic usage
<FortificationSelector
  value={fortification}
  onChange={setFortification}
  rulesVersion="tehnolog"
/>

// With custom class
<FortificationSelector
  value={fortification}
  onChange={setFortification}
  rulesVersion="fan"
  className="mt-4"
/>
```

---

## Component: RulesInfoModal

**Location**: `src/components/RulesInfoModal.tsx`

### Props Interface

```typescript
interface RulesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesVersion: RulesVersionID;
}

type RulesVersionID = 'tehnolog' | 'fan';
```

### Props Description

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Whether modal is open |
| `onClose` | function | Yes | Callback to close modal |
| `rulesVersion` | RulesVersionID | Yes | Rules edition to display |

### Behavior

1. **Rendering**: Modal overlay with glass-strong background
2. **Content**: Rules-specific text explaining mechanics
3. **Close**: X button in top-right, click outside to close
4. **Animation**: Fade in/out (200ms transition)
5. **Mobile**: Full width with padding, max-width on desktop

### Content Structure

**Official Rules (tehnolog)**:
```markdown
## Официальные правила (Технолог)

**Попадание**: Бросок кубика дальности >= расстоянию до цели

**Урон по пехоте**: Каждый кубик > брони цели = 1 ранение

**Урон по технике**: Каждый кубик > брони = 1 повреждение

### Укрепления
- Без укрытия: +0 к броне
- Лёгкое (окопы): +1 к брони
- Бункер: +2 к брони
- Бункер+: +3 к брони

_Источник: docs/original/official_rules.txt, раздел 7_
```

**Fan Rules (panov)**:
```markdown
## Фанатские правила (Панов)

**Попадание**: Бросок кубика дальности >= расстоянию до цели

**Урон по пехоте**: Каждый кубик > брони цели = 1 ранение

**Урон по технике**: Сравнение с зоной прочности
- D6 = 1 урон при пробитии
- D12 = 2 урона при пробитии
- D20 = 3 урона при пробитии

### Укрепления
- Без укрытия: +0 к дистанции
- Лёгкое укрытие: +1 к дистанции
- Полное укрытие (бункер): +2 к дистанции

_Источник: docs/panov/fan_rules.txt, раздел 7_
```

### Visual Specification

```tsx
<div className={clsx(
  "fixed inset-0 z-50 flex items-center justify-center",
  "transition-opacity duration-200",
  isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
)}>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />

  {/* Modal */}
  <div className="relative glass-strong rounded-2xl p-6 max-w-lg w-full mx-4">
    {/* Header with close button */}
    <div className="flex items-start justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
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
```

### Examples

```tsx
// Basic usage
<RulesInfoModal
  isOpen={isInfoOpen}
  onClose={() => setIsInfoOpen(false)}
  rulesVersion={rulesVersion}
/>

// In combat modal header
<div className="flex items-center gap-2">
  <h2>Атака</h2>
  <button onClick={() => setIsInfoOpen(true)} aria-label="Информация о правилах">
    <Info className="w-5 h-5 text-slate-400" />
  </button>
</div>
```

---

## Component: CombatAssistant (Updates)

**Location**: `src/components/CombatAssistant.tsx`

### New Props

```typescript
interface CombatAssistantProps {
  // ... existing props

  // New props
  fortification?: FortificationType;
  onFortificationChange?: (value: FortificationType) => void;
  showRulesInfo?: boolean;
  onRulesInfoClick?: () => void;
}
```

### Layout Changes

**Before**:
```tsx
<div className="combat-modal">
  <h2>Атака</h2>
  {/* Existing attack calculation UI */}
</div>
```

**After**:
```tsx
<div className="combat-modal">
  <div className="flex items-center justify-between">
    <h2>Атака</h2>
    <button onClick={onRulesInfoClick} aria-label="Информация о правилах">
      <Info className="w-5 h-5 text-slate-400" />
    </button>
  </div>

  {/* Fortification selector */}
  <div className="my-4">
    <label className="text-sm text-slate-400 mb-2 block">Укрытие цели</label>
    <FortificationSelector
      value={fortification}
      onChange={onFortificationChange}
      rulesVersion={rulesVersion}
    />
  </div>

  {/* Existing attack calculation UI */}
</div>
```

### State Management

Add to component state:

```typescript
const [fortification, setFortification] = useState<FortificationType>('none');
const [isInfoOpen, setIsInfoOpen] = useState(false);
```

---

## Integration Points

### 1. CombatAssistant Integration

```tsx
// src/components/CombatAssistant.tsx

import { FortificationSelector } from './FortificationSelector';
import { RulesInfoModal } from './RulesInfoModal';

export function CombatAssistant({ /* props */ }) {
  const [fortification, setFortification] = useState<FortificationType>('none');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const rulesVersion = useRulesVersion(); // From context or localStorage

  // Calculate hit with fortification (fan rules only)
  const hitResult = calculateHit(range, distance, fortification);

  // Calculate damage with fortification (official rules only)
  const damageResult = calculateDamage(
    power,
    armor,
    fortification,
    isVehicle,
    currentDurability,
    durabilityMax
  );

  return (
    <div>
      {/* Header with info button */}
      <div className="flex justify-between items-center">
        <h2>Атака</h2>
        <button onClick={() => setIsInfoOpen(true)}>
          <Info />
        </button>
      </div>

      {/* Fortification selector */}
      <FortificationSelector
        value={fortification}
        onChange={setFortification}
        rulesVersion={rulesVersion}
      />

      {/* Existing calculation UI */}

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

### 2. UnitCard Integration

```tsx
// src/components/UnitCard.tsx

// Pass fortification state through to CombatAssistant
<UnitCard
  unit={unit}
  onAttack={() => {
    setCurrentFortification('none'); // Reset on new attack
    setShowCombatModal(true);
  }}
/>
```

### 3. Rules Version Context

```tsx
// src/context/RulesVersionContext.tsx (new)

interface RulesVersionContextValue {
  version: RulesVersionID;
  setVersion: (version: RulesVersionID) => void;
}

export const RulesVersionContext = createContext<RulesVersionContextValue>({
  version: 'tehnolog', // Default
  setVersion: () => {}
});

export function RulesVersionProvider({ children }) {
  const [version, setVersion] = useState<RulesVersionID>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('bronepehota_rules_version');
    return saved === 'fan' ? 'fan' : 'tehnolog';
  });

  useEffect(() => {
    localStorage.setItem('bronepehota_rules_version', version);
  }, [version]);

  return (
    <RulesVersionContext.Provider value={{ version, setVersion }}>
      {children}
    </RulesVersionContext.Provider>
  );
}
```

---

## Accessibility Requirements

### FortificationSelector

- [ ] Radio group role with `aria-label="Укрытие цели"`
- [ ] Each button: `role="radio"`, `aria-checked`, `aria-label`
- [ ] Keyboard navigation: Arrow keys, Space/Enter to select
- [ ] Visual focus indicator (2px slate-500 border)
- [ ] Minimum touch target: 44x44px

### RulesInfoModal

- [ ] Modal role with `aria-modal="true"`
- [ ] Focus trap within modal
- [ ] Escape key closes modal
- [ ] Close button: `aria-label="Закрыть"`
- [ ] Info button: `aria-label="Информация о правилах расчёта"`

---

## Testing Requirements

### Unit Tests

```typescript
// FortificationSelector.test.tsx
describe('FortificationSelector', () => {
  it('renders 4 options', () => { });
  it('calls onChange when option clicked', () => { });
  it('applies correct faction color for active option', () => { });
  it('shows correct labels for teknolog rules', () => { });
  it('shows correct labels for fan rules', () => { });
});

// RulesInfoModal.test.tsx
describe('RulesInfoModal', () => {
  it('displays teknolog rules content', () => { });
  it('displays fan rules content', () => { });
  it('calls onClose when X clicked', () => { });
  it('calls onClose when overlay clicked', () => { });
});
```

### Integration Tests

```typescript
// CombatAssistant.integration.test.tsx
describe('CombatAssistant with fortifications', () => {
  it('passes fortification to damage calculation (tehnolog)', () => { });
  it('passes fortification to hit calculation (fan)', () => { });
  it('resets fortification when attack modal opens', () => { });
});
```
