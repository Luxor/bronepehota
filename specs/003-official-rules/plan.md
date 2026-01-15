# Implementation Plan: Реализация официальных правил расчёта боя

**Branch**: `003-official-rules` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-official-rules/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement accurate combat calculations for both official rules (Технолог) and fan rules (Панов) editions. The feature adds:

1. **Fortification system**: Four types (none, light, bunker, heavy) with different effects per rules edition
   - Official rules: Fortifications add to target armor
   - Fan rules: Fortifications add to effective attack distance

2. **Vehicle damage zones**: Fan rules use zone-based damage calculation (green/yellow/red durability zones) instead of simple armor comparison

3. **Rules information UI**: Information modal and tooltip system explaining calculation mechanics

Technical approach: Extend existing `RulesVersion` interface with optional fortification parameters, add `FortificationType` enum and `DurabilityZone` interface, create new UI components (`FortificationSelector`, `RulesInfoModal`), and update both rules implementations to handle the new mechanics.

## Technical Context

**Language/Version**: TypeScript 5.x (via Next.js 14.2.35, React 18)
**Primary Dependencies**: React 18, Next.js 14, Tailwind CSS, Lucide React, clsx, tailwind-merge
**Storage**: JSON files in `src/data/` (factions.json, squads.json, machines.json) + localStorage for rules version (`bronepehota_rules_version`)
**Testing**: Jest with jsdom environment
**Target Platform**: Web (browser) - responsive design for desktop and mobile
**Project Type**: Web application (Next.js with App Router)
**Performance Goals**: <100ms for combat calculations, instant UI response for fortification selection
**Constraints**: Client-side only (no server calculations), offline-capable, mobile-first UI with 44px minimum touch targets
**Scale/Scope**: ~10 new files, modifications to 5 existing files, ~1500 lines of code including tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on `.specify/memory/constitution.md`:

- [x] **Russian UI**: All new UI text in Russian (fortification labels, rules info content)
- [x] **File-Based Storage**: No changes - using existing JSON files + localStorage for rules version
- [x] **Client-Side State**: Rules version persisted to `bronepehota_rules_version` key (existing)
- [x] **Type Safety**: New types (`FortificationType`, `DurabilityZone`, etc.) added to `src/lib/types.ts`
- [x] **Game Logic Tests**: New tests for fortification mechanics and vehicle zone damage in `src/__tests__/`
- [x] **Dice Notation**: Using existing formats (D6, D12+2, 2D12, ББ) from `game-logic.ts`
- [x] **Faction System**: No changes to `FactionID` or faction data
- [x] **Reference Docs**: Mechanics verified against `docs/original/official_rules.txt` and `docs/panov/fan_rules.txt`
- [x] **Rules Version**: Using existing `bronepehota_rules_version` localStorage key and rules registry
- [x] **Mobile-First**: FortificationSelector uses 44px minimum touch targets, horizontal scroll for mobile
- [x] **Mobile Testing**: Will test fortification selection and rules info modal on mobile/emulation
- [x] **Soldier Images**: No changes to existing soldier image display
- [x] **Visual Design**: Following component design standards (glass-strong modals, 200ms transitions, Tailwind spacing scale)
- [x] **WCAG Contrast**: All new text meets 4.5:1 minimum (slate-300 on slate-700, faction colors on white)
- [x] **Spacing & Typography**: Using Tailwind scale (4px base), Inter font family with proper weight hierarchy
- [x] **Transitions**: 200ms cubic-bezier(0.4, 0, 0.2, 1) for all interactive elements

**Result**: All constitution requirements satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-official-rules/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0: Research findings and decisions
├── data-model.md        # Phase 1: Entity definitions and state transitions
├── quickstart.md        # Phase 1: Developer implementation guide
├── contracts/           # Phase 1: Function and UI component contracts
│   ├── rules-modules.ts # Rules function signatures and algorithms
│   └── ui-components.ts # React component props and behavior
└── tasks.md             # Phase 2: Output from /speckit.tasks command (NOT created yet)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types.ts                    # UPDATE: add FortificationType, DurabilityZone, FORTIFICATION_MODIFIERS
│   ├── rules-registry.ts           # UPDATE: source references changed from PDF to TXT
│   ├── rules/
│   │   ├── tehnolog.ts             # UPDATE: add fortification support to calculateDamage
│   │   └── fan.ts                  # UPDATE: add zone-based vehicle damage, fortification to calculateHit
│   └── game-logic.ts               # EXISTING: shared dice parsing (no changes needed)
├── components/
│   ├── CombatAssistant.tsx         # UPDATE: integrate FortificationSelector and RulesInfoModal
│   ├── UnitCard.tsx                # UPDATE: pass fortification state to combat modal
│   ├── FortificationSelector.tsx   # NEW: horizontal chip buttons for cover selection
│   └── RulesInfoModal.tsx          # NEW: modal with rules explanation content
└── __tests__/
    ├── game-logic.test.ts          # EXTEND: add fortification test cases
    ├── tehnolog-rules.test.ts      # NEW: official rules tests with fortifications
    ├── fan-rules.test.ts           # NEW: fan rules tests with vehicle zones
    ├── FortificationSelector.test.tsx  # NEW: component tests
    └── RulesInfoModal.test.tsx     # NEW: component tests
```

**Structure Decision**: This is a Next.js 14 web application with a single frontend codebase. All game logic runs client-side using React and TypeScript. The `src/` directory contains all application code (lib, components, tests). No backend services are required beyond the existing Next.js API routes for JSON file operations.

## Complexity Tracking

> No constitution violations - this table is not needed

---

## Phase 0: Research ✅ Complete

**Output**: `research.md` with all technical decisions

### Research Findings Summary

1. **Fortification Modifiers**: Enum with 4 types, edition-specific application (armor vs distance)
2. **Durability Zones**: Optional explicit zones in Machine data, fallback to speed_sectors mapping
3. **Fortification UI**: Horizontal chip buttons (radio style) for mobile-friendly single-tap selection
4. **Info Modal Content**: Brief formulas + modifier tables, triggered by info icon button

---

## Phase 1: Design ✅ Complete

**Outputs**: `data-model.md`, `contracts/*.ts`, `quickstart.md`

### Data Model Changes

**New Types**:
- `FortificationType`: 'none' | 'light' | 'bunker' | 'heavy'
- `FortificationModifiers`: { armor: number, distance: number }
- `DurabilityZone`: { max: number, color: 'green'|'yellow'|'red', damagePerDie: {...} }

**Modified Types**:
- `Machine`: Add optional `durabilityZones?: DurabilityZone[]`
- `CalculateHitFn`: Add optional `fortification?: FortificationType` parameter
- `CalculateDamageFn`: Add optional `fortification`, `isVehicle`, `currentDurability`, `durabilityMax` parameters

### Function Contracts

**Official Rules (tehnolog)**:
- `calculateHit`: No fortification effect (fortifications affect damage only)
- `calculateDamage`: Fortification adds to target armor (+1, +2, +3)
- `calculateMelee`: No changes (already correct)

**Fan Rules (panov)**:
- `calculateHit`: Fortification adds to effective distance (+1, +2)
- `calculateDamage` (infantry): Same as official (no fortification effect)
- `calculateDamage` (vehicle): Zone-based calculation with die-type damage (D6=1, D12=2, D20=3)
- `calculateMelee`: No changes (already correct)

### UI Component Contracts

**FortificationSelector**:
- Props: `value`, `onChange`, `rulesVersion`, `className?`
- Displays 4 horizontal chip buttons with faction-colored active state
- 44px minimum height, single-tap selection, accessible (radio role)

**RulesInfoModal**:
- Props: `isOpen`, `onClose`, `rulesVersion`
- Glass-strong modal with rules-specific content
- Fade animation, close on X button or overlay click

---

## Phase 2: Task Generation

**Next Step**: Run `/speckit.tasks` to generate `tasks.md` with actionable implementation tasks

**Expected Tasks** (from Phase 1 design):
1. Add type definitions to `src/lib/types.ts`
2. Update `src/lib/rules/tehnolog.ts` with fortification support
3. Update `src/lib/rules/fan.ts` with zone-based vehicle damage
4. Create `FortificationSelector` component
5. Create `RulesInfoModal` component
6. Update `CombatAssistant` with new components
7. Update `UnitCard` combat modal
8. Write unit tests for rules functions
9. Write component tests
10. Manual testing on mobile

---

## Implementation Notes

### Critical Implementation Details

1. **Fortification Application**:
   - Official rules: `effectiveArmor = targetArmor + FORTIFICATION_MODIFIERS[fortification].armor`
   - Fan rules: `effectiveDistance = distanceSteps + FORTIFICATION_MODIFIERS[fortification].distance`

2. **Zone Determination** (fan rules vehicles):
   ```typescript
   function getDurabilityZone(machine, currentDurability) {
     // Use explicit zones if provided, else derive from speed_sectors
     // Find first zone where currentDurability <= zone.max
   }
   ```

3. **Vehicle Damage** (fan rules):
   ```typescript
   if (isVehicle) {
     const zone = getDurabilityZone(vehicleData, currentDurability);
     for each die:
       if (roll > zone.max) {
         damage += (sides === 6 ? 1 : sides === 12 ? 2 : 3);
       }
   }
   ```

4. **Default Values**:
   - Fortification defaults to 'none' if not provided
   - Vehicle damage falls back to infantry calculation if zone data missing

### Testing Requirements

- Unit tests for all rules functions with fortification combinations
- Component tests for FortificationSelector and RulesInfoModal
- Integration tests for full attack sequences
- Manual mobile testing for touch targets and responsive layout

### Dependencies

- Existing: `src/lib/game-logic.ts` for dice parsing
- Existing: `src/lib/types.ts` for base types
- Existing: `src/lib/rules/` for current implementations
- New: `src/components/FortificationSelector.tsx`
- New: `src/components/RulesInfoModal.tsx`

### References

- Constitution: `.specify/memory/constitution.md`
- Feature Spec: `specs/003-official-rules/spec.md`
- Research: `specs/003-official-rules/research.md`
- Data Model: `specs/003-official-rules/design/data-model.md`
- Contracts: `specs/003-official-rules/design/contracts/*.ts`
- Quickstart: `specs/003-official-rules/design/quickstart.md`
- Official Rules: `docs/original/official_rules.txt`
- Fan Rules: `docs/panov/fan_rules.txt`
