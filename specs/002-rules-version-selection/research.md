# Research: Rules Version Selection

**Feature**: Rules Version Selection
**Date**: 2025-01-11
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing multiple rules versions in the Бронепехота game application.

---

## Decision 1: Rules Version Implementation Pattern

**Question**: How should we structure the rules version registry to support extensibility while maintaining type safety?

### Options Evaluated

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| Class-based polymorphism | Each version as a class implementing `IRulesVersion` interface | Traditional OOP, encapsulation | More verbose, runtime overhead |
| **Function-based registry** | Configuration object with function references | Simple, TypeScript type-safe, no runtime overhead | Manual function binding |
| Zod schema validation | Runtime validation with schemas | Runtime type checking | Additional dependency, slower |

### Selected Approach: Function-based Registry

**Rationale**:
- Aligns with existing functional style in `game-logic.ts`
- Simpler than class-based approach for pure functions
- TypeScript provides compile-time type safety
- Easy to add new versions by exporting a new object
- No runtime overhead of class instantiation

### Implementation Pattern

```typescript
// src/lib/rules-registry.ts
import { tehnologRules } from './rules/tehnolog';
import { panovRules } from './rules/panov';

export type RulesVersionID = 'tehnolog' | 'panov';

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

// Each rules export implements this interface:
interface RulesVersion {
  id: RulesVersionID;
  name: string;
  source: string;
  calculateHit: (rangeStr: string, distanceSteps: number) => HitResult;
  calculateDamage: (powerStr: string, targetArmor: number) => DamageResult;
  calculateMelee: (attackerMelee: number, defenderMelee: number) => MeleeResult;
}
```

---

## Decision 2: localStorage Key Naming

**Question**: What localStorage key should store the selected rules version?

### Options Evaluated

| Option | Description | Assessment |
|--------|-------------|------------|
| `bronepehota_rules_version` | Follows `bronepehota_army` pattern | **SELECTED** |
| `bronepehota_army_rules_version` | More specific | Too long, version independent of army |
| `rules_version` | Simple | Lacks app namespace, potential conflicts |

### Selected: `bronepehota_rules_version`

**Rationale**:
- Follows existing pattern of `bronepehota_army` prefix
- Scoped to the application namespace
- Descriptive but concise
- No conflicts with existing keys

---

## Decision 3: Rules Version Selector Placement

**Question**: Where exactly in the builder view header should the selector appear?

### Options Evaluated

| Option | Description | Assessment |
|--------|-------------|------------|
| **Left side, next to faction badge** | Groups config items together | **SELECTED** |
| Right side, in navigation | Groups with actions | Less intuitive, rules is config not action |
| Below header, separate section | More prominent | Wastes vertical space, breaks header flow |

### Selected: Left side, next to faction badge in ArmyBuilder header

**Rationale**:
- Groups configuration-related items (faction + rules) together
- Balances header layout (config on left, actions on right)
- Consistent with existing header pattern
- Compact badge display fits well next to faction name

---

## Decision 4: Removing CombatAssistant Tab

**Question**: How should we remove the "Атака" tab without breaking existing functionality?

### Options Evaluated

| Option | Description | Assessment |
|--------|-------------|------------|
| Delete CombatAssistant.tsx entirely | Clean removal | May break unit card calculations if referenced |
| Comment out code, keep for reference | Preserves code | Dead code, confusing for future developers |
| **Keep file, remove from GameSession** | Preserves for potential reuse | **SELECTED** |

### Selected: Keep CombatAssistant.tsx but remove its usage from GameSession

**Rationale**:
- Combat calculations remain available in unit cards (FR-006)
- File may contain reusable logic for unit card modals
- Can be completely removed in future cleanup if confirmed unused
- Git history preserves original implementation if needed

**Implementation**: Remove import, `showCombat` state, "Атака" button, and conditional rendering of CombatAssistant component from GameSession.tsx.

---

## Decision 5: Default Rules Version Behavior

**Question**: Should we show an indicator when using the default vs. explicitly selected rules version?

### Options Evaluated

| Option | Description | Assessment |
|--------|-------------|------------|
| **No indicator** | Always show selected version | **SELECTED** |
| "(по умолчанию)" suffix | Indicates default state | Adds cognitive load, distinction not useful |
| Different badge styling | Visual distinction | Inconsistent with faction display |

### Selected: Always show the selected version name without distinction

**Rationale**:
- Simpler UI, less cognitive load
- Default vs. explicit selection is transparent to users
- Badge displays current state, not how we got there
- Consistent with faction display pattern

---

## Technical Constraints & Considerations

### Type Safety

- All rules versions must implement the `RulesVersion` interface
- TypeScript will catch missing functions at compile time
- `RulesVersionID` union type ensures only valid versions are referenced

### Performance

- Combat calculations must complete within 100ms of version switch (SC-002)
- Function-based registry has negligible overhead (direct object property access)
- No lazy loading needed for ~2-3 rules versions

### Extensibility

- Adding new version requires:
  1. Create new file in `src/lib/rules/`
  2. Implement calculation functions
  3. Export as `RulesVersion` object
  4. Add to `rulesRegistry` and `RulesVersionID` type

### Mobile Considerations

- Selector dropdown must be 44x44px minimum on mobile
- Consider full-width dropdown on small screens
- Badge should be readable without horizontal scrolling

---

## Open Questions (Resolved)

All questions resolved through clarifications session (2025-01-11):

1. **Selector visibility**: Builder view only, not in game view ✓
2. **Default version**: "Технолог" (official version) ✓
3. **localStorage recovery**: Silent fallback to default ✓
4. **Registration method**: TypeScript code configuration ✓
5. **Badge placement**: Compact badge next to selector ✓

---

## References

- Existing `game-logic.ts`: Contains current "Технолог" implementations
- Spec: `specs/002-rules-version-selection/spec.md`
- Constitution: `.specify/memory/constitution.md`
- Rule PDFs: `docs/original/Bronepekhota_Pravila_05_08_08.pdf`, `docs/panov/rules-originnal.pdf`
