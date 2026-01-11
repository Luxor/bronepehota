# Implementation Plan: Show Unit Details in Army Builder

**Branch**: `001-show-unit-details` | **Date**: 2025-01-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-show-unit-details/spec.md`

## Summary

This feature adds the ability for users to view detailed unit characteristics (soldier stats, machine weapons, speed sectors) directly from the army builder interface without adding units to the army. The implementation will use modal dialogs triggered by clicking/hovering on unit cards, with responsive design for mobile devices.

## Technical Context

**Language/Version**: TypeScript 5.x (via Next.js 14)
**Primary Dependencies**: React 18, Next.js 14, Tailwind CSS, Lucide React
**Storage**: JSON files in `src/data/` (factions.json, squads.json, machines.json) + localStorage for army state
**Testing**: Jest with jsdom environment
**Target Platform**: Web (responsive browser application)
**Project Type**: Single web application
**Performance Goals**: <300ms modal open time, smooth animations, mobile-optimized
**Constraints**: Must work offline after initial load, touch-friendly 44x44px minimum
**Scale/Scope**: Small to medium (display details for ~50 units total)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on `.specify/memory/constitution.md`:

- [x] **Russian UI**: All user-facing text, error messages, tooltips in Russian? YES - All UI text will be in Russian
- [x] **File-Based Storage**: Game data in `src/data/` JSON files? API routes use sync file ops? YES - No changes to data layer
- [x] **Client-Side State**: Army state in `localStorage` with key `bronepehota_army`? YES - No changes to state management
- [x] **Type Safety**: Types in `src/lib/types.ts`? No `any` without justification? YES - Will use existing types
- [x] **Game Logic Tests**: Tests in `src/__tests__/` for mechanics in `game-logic.ts`? N/A - No game logic changes
- [x] **Dice Notation**: Correct formats (D6, D12+2, 2D12, ББ)? N/A - No dice notation changes
- [x] **Faction System**: FactionID type updated? JSON data files updated? N/A - No faction changes
- [x] **Reference Docs**: Game mechanics verified against `doc/panov/` materials? N/A - Display only, no mechanics changes
- [x] **Mobile-First**: Touch-friendly? Responsive layout? 44x44px min tap targets? YES - Will ensure 44x44px minimum
- [x] **Mobile Testing**: Core flows tested on mobile/emulation? YES - Will test modal on mobile
- [x] **Soldier Images**: Visible and identifiable on mobile for unit selection? YES - Will display images in modal

**Status**: ✅ PASSED - No violations. All UI-only feature, no game logic or data changes.

## Project Structure

### Documentation (this feature)

```text
specs/001-show-unit-details/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for this UI-only feature)
└── checklists/
    └── requirements.md  # Quality checklist (completed)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ArmyBuilder.tsx         # Existing - will add click handlers
│   ├── UnitSelector.tsx        # Existing - will add click handlers
│   └── UnitDetailsModal.tsx    # NEW - modal for displaying unit details
├── lib/
│   └── types.ts                # Existing - no changes needed
└── data/
    ├── factions.json           # Existing - no changes
    ├── squads.json             # Existing - no changes
    └── machines.json           # Existing - no changes
```

**Structure Decision**: Single Next.js web application. New component `UnitDetailsModal.tsx` will handle displaying unit details. Existing components (`ArmyBuilder.tsx`, `UnitSelector.tsx`) will be modified to trigger the modal.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - table empty.

---

## Phase 0: Research ✅ Complete

**Output**: [research.md](research.md)

**Decisions Made**:
- Use controlled React component with fixed overlay for modal
- Full-screen on mobile, centered card (max-width 600px) on desktop
- No external libraries needed
- ARIA attributes for accessibility
- Click-outside and Escape key to close

## Phase 1: Design ✅ Complete

**Outputs**:
- [data-model.md](data-model.md) - Entity definitions and data flow
- [quickstart.md](quickstart.md) - Implementation guide for developers

**Design Decisions**:
- No new data entities - uses existing types from `src/lib/types.ts`
- New component: `UnitDetailsModal.tsx`
- Parent state management in `ArmyBuilder.tsx` and `UnitSelector.tsx`
- Responsive layout with Tailwind CSS

**Constitution Re-check**: ✅ PASSED - No violations

---

## Ready for Implementation

This plan is complete. Next step: `/speckit.tasks` to generate implementation tasks.
