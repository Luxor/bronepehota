# Implementation Plan: Rules Version Selection

**Branch**: `002-rules-version-selection` | **Date**: 2025-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rules-version-selection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add support for multiple combat rules versions ("Технолог" and "Панов") with a selector in the builder view, persistent localStorage storage, and an extensible TypeScript configuration architecture. Remove the standalone "Атака" (Attack Calculator) tab from the game session interface. Combat calculations will use version-specific implementations of hit, damage, and melee formulas.

## Technical Context

**Language/Version**: TypeScript 5.x (via Next.js 14.2.35, React 18)
**Primary Dependencies**: React 18, Next.js 14, Tailwind CSS, Lucide React, clsx, tailwind-merge
**Storage**: localStorage for rules version persistence (key: `bronepehota_rules_version`), JSON files for game data in `src/data/`
**Testing**: Jest with jsdom environment, ts-jest transformer
**Target Platform**: Web browser (desktop + mobile), Next.js SSR with client-side state management
**Project Type**: web (Next.js single-project)
**Performance Goals**: Combat calculations update within 100ms of rules version switch
**Constraints**: Mobile-first responsive design, 44x44px minimum tap targets, Russian UI text
**Scale/Scope**: ~2-3 rules versions initially, extensible to ~5-10 versions via configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on `.specify/memory/constitution.md`:

- [x] **Russian UI**: All user-facing text, error messages, tooltips in Russian? ✓ Yes (FR-010, all selector labels in Russian)
- [x] **File-Based Storage**: Game data in `src/data/` JSON files? API routes use sync file ops? ✓ N/A (no new API routes, rules config in TypeScript file per clarification)
- [x] **Client-Side State**: Army state in `localStorage` with key `bronepehota_army`? ✓ Yes (new key `bronepehota_rules_version` for version selection)
- [x] **Type Safety**: Types in `src/lib/types.ts`? No `any` without justification? ✓ Yes (RulesVersion types will be added)
- [x] **Game Logic Tests**: Tests in `src/__tests__/` for mechanics in `game-logic.ts`? ✓ Yes (new tests for version-specific calculations)
- [x] **Dice Notation**: Correct formats (D6, D12+2, 2D12, ББ)? ✓ Yes (existing notation maintained)
- [x] **Faction System**: FactionID type updated? JSON data files updated? ✓ N/A (no faction changes)
- [x] **Reference Docs**: Game mechanics verified against `doc/panov/` and `doc/original/` materials? ✓ Yes (two PDF sources: Bronepekhota_Pravila_05_08_08.pdf and rules-originnal.pdf)
- [x] **Mobile-First**: Touch-friendly? Responsive layout? 44x44px min tap targets? ✓ Yes (compact badge design, responsive dropdown)
- [x] **Mobile Testing**: Core flows tested on mobile/emulation? ✓ Yes (selector accessible in builder view)
- [x] **Soldier Images**: Visible and identifiable on mobile for unit selection? ✓ N/A (no changes to soldier images)

All gates passed. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-rules-version-selection/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command - N/A for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types.ts                 # UPDATE: Add RulesVersionID, RulesVersion types
│   ├── game-logic.ts            # UPDATE: Refactor to use versioned calculations
│   ├── rules-registry.ts        # NEW: Rules version configuration with type safety
│   └── rules/
│       ├── tehnolog.ts          # NEW: "Технолог" version calculations (existing logic)
│       └── panov.ts             # NEW: "Панов" version calculations
├── components/
│   ├── ArmyBuilder.tsx          # UPDATE: Add RulesVersionSelector component
│   ├── GameSession.tsx          # UPDATE: Remove "Атака" tab and showCombat state
│   ├── RulesVersionSelector.tsx # NEW: Dropdown selector component with badge
│   └── CombatAssistant.tsx      # DELETE: Remove standalone calculator tab
└── __tests__/
    ├── game-logic.test.ts       # UPDATE: Add version-specific calculation tests
    └── rules-registry.test.ts   # NEW: Test rules registry and version switching

public/
└── images/                      # No changes (existing structure)

data/
├── factions.json                # No changes
├── squads.json                  # No changes
└── machines.json                # No changes
```

**Structure Decision**: This is a Next.js 14 single-project application with client-side state management. The rules version selection feature follows the existing pattern of localStorage for user preferences and TypeScript configuration for type-safe extensibility. No backend changes are required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution gates passed.

---

# Phase 0: Research & Technical Decisions

## Research Tasks

### 1. Rules Version Implementation Pattern

**Question**: How should we structure the rules version registry to support extensibility while maintaining type safety?

**Options Considered**:
1. **Class-based polymorphism** - Each version as a class implementing an interface
2. **Function-based registry** - Configuration object with function references (CHOSEN)
3. **Zod schema validation** - Runtime validation with schemas

**Decision**: Function-based registry in TypeScript configuration file

**Rationale**:
- Aligns with existing functional style in `game-logic.ts`
- Simpler than class-based approach for pure functions
- TypeScript provides compile-time type safety
- Easy to add new versions by exporting a new object
- No runtime overhead of class instantiation

**Implementation Pattern**:
```typescript
// src/lib/rules-registry.ts
import { tehnologRules } from './rules/tehnolog';
import { panovRules } from './rules/panov';

export type RulesVersionID = 'tehnolog' | 'panov';

export const rulesRegistry: Record<RulesVersionID, RulesVersion> = {
  tehnolog: tehnologRules,
  panov: panovRules,
};

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

### 2. localStorage Key Naming

**Question**: What localStorage key should store the selected rules version?

**Options Considered**:
1. `bronepehota_rules_version` (CHOSEN)
2. `bronepehota_army_rules_version`
3. `rules_version`

**Decision**: `bronepehota_rules_version`

**Rationale**:
- Follows existing pattern of `bronepehota_army` prefix
- Scoped to the application namespace
- Descriptive but concise
- No conflicts with existing keys

### 3. Rules Version Selector Placement

**Question**: Where exactly in the builder view header should the selector appear?

**Options Considered**:
1. Left side, next to faction badge (CHOSEN)
2. Right side, in navigation area
3. Below header, as separate section

**Decision**: Left side, next to faction badge in ArmyBuilder view

**Rationale**:
- Groups configuration-related items (faction + rules) together
- Balances header layout (config on left, actions on right)
- Consistent with existing header pattern
- Compact badge display fits well next to faction name

### 4. Removing CombatAssistant Tab

**Question**: How should we remove the "Атака" tab without breaking existing functionality?

**Options Considered**:
1. Delete CombatAssistant.tsx entirely
2. Comment out code, keep file for reference
3. Keep file but remove from GameSession (CHOSEN)

**Decision**: Keep CombatAssistant.tsx but remove its usage from GameSession

**Rationale**:
- Combat calculations remain available in unit cards (FR-006)
- File may contain reusable logic for unit card modals
- Can be completely removed in future cleanup if confirmed unused
- Git history preserves original implementation if needed

### 5. Default Rules Version Behavior

**Question**: Should we show an indicator when using the default vs. explicitly selected rules version?

**Options Considered**:
1. No indicator - always show selected version (CHOSEN)
2. Show "(по умолчанию)" suffix for default
3. Different badge styling for default

**Decision**: Always show the selected version name without distinction

**Rationale**:
- Simpler UI, less cognitive load
- Default vs. explicit selection is transparent to users
- Badge displays current state, not how we got there
- Consistent with faction display pattern

---

# Phase 1: Design & Contracts

## Data Model

See [data-model.md](./data-model.md) for complete entity definitions, state transitions, and validation rules.

**Key Entities**:
- `RulesVersionID`: Union type of all valid version identifiers
- `RulesVersion`: Interface defining version metadata and calculation functions
- `RulesVersionState`: React state for selected version with localStorage persistence

## API Contracts

*No API contracts required for this feature.*

This feature is entirely client-side. No API routes are added or modified. All state is managed through:
- React useState for component state
- localStorage for persistence (key: `bronepehota_rules_version`)
- TypeScript configuration for rules registry

## Component Architecture

### New Components

1. **RulesVersionSelector** (`src/components/RulesVersionSelector.tsx`)
   - Props: `selectedVersion: RulesVersionID`, `onVersionChange: (id: RulesVersionID) => void`
   - Renders: Compact badge + dropdown selector
   - Position: ArmyBuilder header, left side next to faction badge
   - Mobile: Full-width dropdown on small screens
   - Error Handling: Wrap calculation calls in try-catch, display Russian error message on failure (per spec Edge Case #2)

### Modified Components

1. **ArmyBuilder** (`src/components/ArmyBuilder.tsx`)
   - Add: RulesVersionSelector component in header
   - Add: State management for selected rules version
   - Add: localStorage synchronization on mount/change

2. **GameSession** (`src/components/GameSession.tsx`)
   - Remove: `showCombat` state
   - Remove: "Атака" button from control bar
   - Remove: CombatAssistant component import and rendering
   - Keep: All unit card combat functionality intact

3. **types.ts** (`src/lib/types.ts`)
   - Add: `RulesVersionID` type union
   - Add: `RulesVersion` interface
   - Add: Export for rules registry types

### New Modules

1. **rules-registry.ts** (`src/lib/rules-registry.ts`)
   - Exports: `rulesRegistry`, `RulesVersionID`, `getDefaultRulesVersion()`, `getRulesVersion(id)`
   - Purpose: Central configuration for all rules versions

2. **rules/tehnolog.ts** (`src/lib/rules/tehnolog.ts`)
   - Contains: Existing calculation logic from `game-logic.ts`
   - Refactored: Export as `RulesVersion` object

3. **rules/panov.ts** (`src/lib/rules/panov.ts`)
   - Contains: "Панов" version calculation implementations
   - Implements: Same function signatures with different formulas

## Quickstart Guide

See [quickstart.md](./quickstart.md) for development setup and testing instructions.

**Summary**:
1. Create `rules-registry.ts` with version configuration
2. Implement `tehnolog.ts` by refactoring existing `game-logic.ts`
3. Implement `panov.ts` with version-specific formulas
4. Create `RulesVersionSelector` component
5. Update `ArmyBuilder` to include selector
6. Remove "Атака" tab from `GameSession`
7. Add tests for version-specific calculations
8. Test on mobile for responsive selector behavior

---

# Phase 2: Implementation Tasks

*This section is NOT filled by `/speckit.plan`. Run `/speckit.tasks` to generate `tasks.md`.*
