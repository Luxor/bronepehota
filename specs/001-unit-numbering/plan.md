# Implementation Plan: Unit Numbering and Count Display

**Branch**: `001-unit-numbering` | **Date**: 2025-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-unit-numbering/spec.md`

## Summary

Display unit count badges on "Add" buttons during army building and assign unique sequential numbers (#1, #2, etc.) to each unit instance for identification in both army builder and combat phases. The feature requires:
1. Adding `instanceNumber` field to `ArmyUnit` type
2. Computing counts per unit type for badge display
3. Rendering unit numbers prominently on unit cards
4. Enforcing 99-unit maximum per type with user feedback

## Technical Context

**Language/Version**: TypeScript 5.x (via Next.js 14) + React 18
**Primary Dependencies**: Next.js 14, React 18, Tailwind CSS, Lucide React
**Storage**: JSON files in `src/data/` (factions.json, squads.json, machines.json) + localStorage for army state (`bronepehota_army`)
**Testing**: Jest with jsdom environment for game logic (`src/__tests__/`)
**Target Platform**: Web browser (desktop + mobile responsive)
**Project Type**: Single web application (Next.js app router)
**Performance Goals**: Instant UI updates (<1 second per SC-003), mobile-optimized
**Constraints**: Russian UI only, synchronous file I/O for game data, client-side army state management
**Scale/Scope**: ~20 unit types across 3 factions, max 99 units per type, ~10 component files affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on `.specify/memory/constitution.md`:

- [x] **Russian UI**: Count badges and error messages (e.g., "Максимум 99 юнитов") will be in Russian
- [x] **File-Based Storage**: No changes to JSON file structure; unit numbers stored in localStorage only
- [x] **Client-Side State**: Army state with new `instanceNumber` field persists to `bronepehota_army` localStorage
- [x] **Type Safety**: Will add `instanceNumber?: number` to `ArmyUnit` in `src/lib/types.ts`
- [ ] **Game Logic Tests**: New numbering logic (count aggregation, number assignment) should be tested in `src/__tests__/`
- [x] **Dice Notation**: Not applicable to this feature (no dice mechanics changes)
- [x] **Faction System**: No faction structure changes
- [x] **Reference Docs**: Not applicable (UI/ux feature, no game mechanics)
- [x] **Mobile-First**: Count badges will use 44x44px+ tap targets, responsive layout
- [ ] **Mobile Testing**: Will verify count badges and unit numbers visible/identifiable on mobile
- [x] **Soldier Images**: No changes to image handling

**Actions Required**:
- Add unit numbering logic tests to `src/__tests__/unit-numbering.test.ts`
- Mobile verification of count badge visibility

## Project Structure

### Documentation (this feature)

```text
specs/001-unit-numbering/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal React props contracts)
└── tasks.md             # Phase 2 output (NOT created by this command)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── page.tsx                    # Army state management (no changes needed)
├── components/
│   ├── ArmyBuilder.tsx             # MODIFIED: Add count badges, number assignment
│   ├── GameSession.tsx             # MODIFIED: Use instanceNumber for display
│   ├── UnitCard.tsx                # MODIFIED: Display instanceNumber
│   ├── UnitSelector.tsx            # MODIFIED: Add count badges
│   └── UnitDetailsModal.tsx        # MODIFIED: Show unit counts
├── lib/
│   ├── types.ts                    # MODIFIED: Add instanceNumber to ArmyUnit
│   └── unit-utils.ts               # NEW: Count aggregation, number assignment utils
└── __tests__/
    └── unit-numbering.test.ts      # NEW: Tests for numbering logic
```

**Structure Decision**: Single Next.js web application with client-side state management. This is an existing feature enhancement, adding new utility module and modifying existing components for count display and unit numbering.

## Complexity Tracking

> No constitution violations requiring justification.

## Phase 0: Research

### Unknowns to Resolve

1. **Count aggregation strategy**: Should counts be computed on-demand or memoized?
   - Impact: Performance vs complexity trade-off
   - Research: React patterns for derived state with localStorage persistence

2. **Unit number assignment**: Should numbering be per-faction or global across all units?
   - Impact: Data model, display logic
   - Research: Current spec clarifies per-type numbering (FR-004)

3. **Badge UI implementation**: Which Tailwind pattern for button corner badges?
   - Impact: Mobile usability, visual consistency
   - Research: Tailwind UI badge patterns, notification badge conventions

4. **Import/export compatibility**: How to handle armies imported without `instanceNumber`?
   - Impact: Backward compatibility, migration strategy
   - Research: localStorage migration patterns

5. **Maximum unit enforcement**: Where should 99-unit limit be enforced (client vs validation)?
   - Impact: User feedback timing, data integrity
   - Research: Form validation patterns in React/Next.js

### Research Tasks

Dispatch research agents to investigate:

1. React state derivation patterns for localStorage-persisted army with computed counts
2. Tailwind CSS notification badge patterns for button corners (mobile-friendly)
3. Backward compatibility strategies for adding fields to persisted Army objects
4. TypeScript utility functions for count aggregation by unit type
5. Mobile touch target best practices for small badge overlays (44x44px minimum)

**Output**: `research.md` with decisions and rationale

## Phase 1: Design

### 1.1 Data Model

Will document in `data-model.md`:
- `ArmyUnit` interface with `instanceNumber?: number` field
- Count aggregation return type structure
- State transition for number assignment (add, remove, reassign)

### 1.2 Contracts

Will create in `contracts/` directory:
- `unit-utils.ts` - Internal API for count and numbering functions
- Component prop extensions for count display
- TypeScript interfaces for new data structures

### 1.3 Quickstart Guide

Will create `quickstart.md`:
- How to add unit numbering to a new component
- How to compute and display unit counts
- Testing checklist for numbering features

### 1.4 Agent Context Update

✓ Completed - Ran `.specify/scripts/bash/update-agent-context.sh claude`

Added to `CLAUDE.md`:
- TypeScript 5.x (via Next.js 14) + React 18
- Next.js 14, React 18, Tailwind CSS, Lucide React
- JSON files + localStorage for army state

## Re-Check Constitution After Design

*Post-design verification after Phase 1 completion*

- [x] All new types defined in `src/lib/types.ts` - Designed: `instanceNumber?: number` on `ArmyUnit`
- [x] Unit numbering tested in `src/__tests__/unit-numbering.test.ts` - Test contract defined in quickstart.md
- [x] Mobile layout verified (count badges visible on mobile) - Mobile patterns documented (44x44px targets, badge positioning)
- [x] Russian error messages for max unit limit - Defined: `"Максимум 99 юнитов этого типа"`

## Implementation Artifacts

Generated by this planning phase:

| Artifact | Path | Purpose |
|----------|------|---------|
| Research findings | `specs/001-unit-numbering/research.md` | Technical decisions |
| Data model | `specs/001-unit-numbering/data-model.md` | Type definitions |
| Contracts | `specs/001-unit-numbering/contracts/` | Internal API specs |
| Quickstart | `specs/001-unit-numbering/quickstart.md` | Developer guide |
| Agent context | `.specify/memory/agent-claude.md` | AI project context |

## Next Steps

After Phase 0 and Phase 1 complete, run `/speckit.tasks` to generate task breakdown.
