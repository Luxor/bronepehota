---

description: "Task list for Army Building Flow feature implementation"
---

# Tasks: Army Building Flow

**Input**: Design documents from `/specs/001-army-building-flow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md

**Tests**: Tests are OPTIONAL for this feature. Test tasks are included but can be skipped if not following TDD approach.

**Mobile-First Focus**: Per Constitution Principle VI, this feature prioritizes mobile usability. Additional verification tasks (T065a-c, T066a-c, T078-079) ensure touch targets and image visibility meet requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single web application structure: `src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing project structure for new components

- [X] T001 Verify existing project dependencies in package.json (React 18, Next.js 14, Tailwind CSS, Lucide React)
- [X] T002 [P] Create component stub files: src/components/FactionSelector.tsx, src/components/PointBudgetInput.tsx, src/components/UnitSelector.tsx
- [X] T003 [P] Create test file stub: src/__tests__/army-building.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extend Army interface in src/lib/types.ts with pointBudget, currentStep, and isInBattle fields
- [X] T005 Add currentStep union type to Army type in src/lib/types.ts ('faction-select' | 'unit-select' | 'battle')
- [X] T006 Verify existing Faction and Squad types have all required fields in src/lib/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Faction Selection and Point Budget (Priority: P1) 🎯 MVP

**Goal**: Enable players to select a faction and set point budget (presets or custom)

**Independent Test**: Select each faction, verify faction info displays, choose preset/custom point values, confirm selection persists to next step

### Tests for User Story 1 (OPTIONAL)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Test faction selection renders all factions in src/__tests__/army-building.test.tsx
- [ ] T008 [P] [US1] Test point budget preset buttons work in src/__tests__/army-building.test.tsx
- [ ] T009 [P] [US1] Test custom point input validation in src/__tests__/army-building.test.tsx

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement FactionSelector component in src/components/FactionSelector.tsx with card-based layout
- [X] T011 [US1] Add faction card expansion state and handlers in src/components/FactionSelector.tsx
- [X] T012 [US1] Implement mobile-responsive faction card layout in src/components/FactionSelector.tsx (full-width on mobile, grid on desktop, minimum 80px card height)
- [X] T013 [US1] Add 44x44px minimum tap targets to faction cards in src/components/FactionSelector.tsx (explicit min-height or min-width styles)
- [X] T014 [P] [US1] Implement PointBudgetInput component in src/components/PointBudgetInput.tsx with preset buttons (48px height for touch targets)
- [X] T015 [P] [US1] Add custom number input field to src/components/PointBudgetInput.tsx
- [X] T016 [US1] Implement input validation (1-10000 range) in src/components/PointBudgetInput.tsx with Russian error messages
- [X] T017 [US1] Add keyboard accessibility to src/components/FactionSelector.tsx (arrow keys, Enter to select)
- [X] T018 [US1] Add ARIA labels to faction cards in src/components/FactionSelector.tsx
- [X] T019 [US1] Add mobile keyboard optimization to src/components/PointBudgetInput.tsx (type="number")
- [X] T020 [US1] Integrate FactionSelector into ArmyBuilder in src/components/ArmyBuilder.tsx with currentStep rendering
- [X] T021 [US1] Integrate PointBudgetInput into ArmyBuilder in src/components/ArmyBuilder.tsx below faction selection
- [X] T022 [US1] Add handleFactionSelect callback to src/app/page.tsx
- [X] T023 [US1] Add handleSetPointBudget callback to src/app/page.tsx with auto-transition to unit-select step
- [X] T024 [US1] Initialize Army state with currentStep='faction-select' in src/app/page.tsx
- [X] T025 [US1] Add localStorage persistence for pointBudget and currentStep in src/app/page.tsx useEffect

**Checkpoint**: At this point, User Story 1 should be fully functional - players can select faction and set point budget, advancing to unit selection

---

## Phase 4: User Story 2 - Unit Selection Within Point Budget (Priority: P2)

**Goal**: Enable players to add/remove units within point budget constraints

**Independent Test**: Select units, verify budget tracking, test over-budget prevention, confirm add/remove updates remaining points

### Tests for User Story 2 (OPTIONAL)

- [ ] T026 [P] [US2] Test unit filtering by faction in src/__tests__/army-building.test.tsx
- [ ] T027 [P] [US2] Test budget calculation and remaining points display in src/__tests__/army-building.test.tsx
- [ ] T028 [P] [US2] Test over-budget prevention and warning in src/__tests__/army-building.test.tsx

### Implementation for User Story 2

- [X] T029 [P] [US2] Implement UnitSelector component in src/components/UnitSelector.tsx with unit list display
- [X] T030 [US2] Add faction filtering logic to UnitSelector in src/components/UnitSelector.tsx
- [X] T031 [US2] Implement remaining points calculation in src/components/UnitSelector.tsx
- [X] T032 [US2] Add budget display component in src/components/UnitSelector.tsx with color coding (green/yellow/red)
- [X] T033 [US2] Implement add unit button with budget check in src/components/UnitSelector.tsx
- [X] T034 [US2] Add over-budget warning toast in src/components/UnitSelector.tsx with Russian message "Недостаточно очков"
- [X] T035 [US2] Implement remove unit functionality in src/components/UnitSelector.tsx
- [X] T036 [US2] Add unit cost display to each unit card in src/components/UnitSelector.tsx
- [X] T037 [US2] Ensure unit images are minimum 120px width on mobile in src/components/UnitSelector.tsx (use responsive image sizing, lazy loading)
- [X] T038 [US2] Add 48x48px minimum tap targets for add/remove buttons in src/components/UnitSelector.tsx (explicit min-width/height styles)
- [X] T039 [US2] Integrate UnitSelector into ArmyBuilder in src/components/ArmyBuilder.tsx with currentStep='unit-select' rendering
- [X] T040 [US2] Add handleAddUnit callback to src/app/page.tsx with totalCost recalculation
- [X] T041 [US2] Add handleRemoveUnit callback to src/app/page.tsx with totalCost recalculation
- [X] T042 [US2] Add "В бой" (To Battle) button to UnitSelector in src/components/UnitSelector.tsx
- [X] T043 [US2] Add empty army warning to "В бой" button in src/components/UnitSelector.tsx (optional)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - players can select faction, set budget, and add/remove units within constraints

---

## Phase 5: User Story 3 - Battle Phase Lockout (Priority: P3)

**Goal**: Prevent army modifications during battle phase, require battle completion to return

**Independent Test**: Enter battle, attempt return to builder (blocked), end battle, verify return to fresh faction selection

### Tests for User Story 3 (OPTIONAL)

- [ ] T044 [P] [US3] Test battle phase transition in src/__tests__/army-building.test.tsx
- [ ] T045 [P] [US3] Test army builder lockout during battle in src/__tests__/army-building.test.tsx
- [ ] T046 [P] [US3] Test battle exit resets army in src/__tests__/army-building.test.tsx

### Implementation for User Story 3

- [X] T047 [P] [US3] Add handleEnterBattle callback to src/app/page.tsx with isInBattle=true set
- [X] T048 [P] [US3] Add handleEndBattle callback to src/app/page.tsx with full army reset
- [X] T049 [US3] Set currentStep='battle' when entering battle in src/app/page.tsx handleEnterBattle
- [X] T050 [US3] Reset Army state to initial values in src/app/page.tsx handleEndBattle (fresh start)
- [X] T051 [US3] Pass isInBattle prop to GameSession in src/app/page.tsx
- [X] T052 [US3] Add onEndBattle callback prop to GameSession in src/app/page.tsx
- [X] T053 [US3] Extend GameSession component in src/components/GameSession.tsx with isInBattle prop
- [X] T054 [US3] Hide/disable "Штаб" button in GameSession when isInBattle=true in src/components/GameSession.tsx
- [X] T055 [US3] Add "Завершить бой" (End battle) button to GameSession in src/components/GameSession.tsx
- [X] T056 [US3] Wire onEndBattle to "Завершить бой" button in src/components/GameSession.tsx
- [ ] T057 [US3] Add faction switch confirmation dialog in ArmyBuilder src/components/ArmyBuilder.tsx (optional: "Сменить фракцию? Выбранные юниты будут очищены")

**Checkpoint**: All user stories should now be independently functional - complete army building flow with battle lockout

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add edge case handling for invalid point values (negative, zero) in src/components/PointBudgetInput.tsx
- [ ] T059 [P] Add edge case handling for empty faction selection in src/components/FactionSelector.tsx
- [ ] T060 [P] Add edge case handling for all units exceeding budget in src/components/UnitSelector.tsx (empty state message)
- [ ] T061 [P] Add edge case handling for localStorage corruption recovery in src/app/page.tsx
- [ ] T062 [P] Add loading states for faction/squad data fetch in src/components/ArmyBuilder.tsx
- [ ] T063 [P] Add error boundary for army building flow in src/app/page.tsx
- [ ] T064 Verify all UI text is in Russian per Constitution Principle I (review all components)
- [ ] T065a Verify faction card tap targets are 44x44px minimum in src/components/FactionSelector.tsx (per FR-019)
- [ ] T065b Verify preset button tap targets are 44x44px minimum in src/components/PointBudgetInput.tsx (per FR-019)
- [ ] T065c Verify add/remove button tap targets are 48x48px minimum in src/components/UnitSelector.tsx (per FR-019)
- [ ] T066a Verify faction images are minimum 120px width on mobile in src/components/FactionSelector.tsx (per FR-018)
- [ ] T066b Verify unit images are minimum 120px width on mobile in src/components/UnitSelector.tsx (per FR-018)
- [ ] T066c Verify image quality and clarity for unit identification on mobile devices (per FR-018, SC-008)
- [ ] T067 Run ESLint and fix issues: npm run lint
- [ ] T068 Run TypeScript compilation: npx tsc --noEmit
- [ ] T069 [P] Add additional unit tests for edge cases in src/__tests__/army-building.test.tsx
- [ ] T070 Manual test: Refresh page and verify state persists from localStorage
- [ ] T071 Manual test: Complete army building flow on mobile device or DevTools emulation
- [ ] T072 Manual test: Verify all 3 factions work correctly
- [ ] T073 Manual test: Verify all 4 preset values work (250, 350, 500, 1000)
- [ ] T074 Manual test: Verify custom input validation (negative, zero, large values)
- [ ] T075 Manual test: Verify over-budget add prevention shows warning
- [ ] T076 Manual test: Verify battle phase lockout prevents return to builder
- [ ] T077 Manual test: Verify battle exit returns to fresh faction selection
- [ ] T078 Manual mobile test: Measure all tap targets confirm 44x44px minimum (use DevTools inspect)
- [ ] T079 Manual mobile test: Verify all faction and unit images clearly identifiable on actual mobile device

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Faction/Budget)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - Unit Selection)**: Can start after Foundational (Phase 2) - Extends ArmyBuilder but independently testable
- **User Story 3 (P3 - Battle Lockout)**: Can start after Foundational (Phase 2) - Extends GameSession but independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Component stubs before implementation
- Core component logic before integration
- Integration before callbacks
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002 (component stubs) and T003 (test stubs) can run in parallel

**Foundational Phase (Phase 2)**:
- T006 (verify types) can run in parallel with T004/T005 (type extensions)

**User Story 1 Tests (if TDD)**:
- T007, T008, T009 can run in parallel

**User Story 1 Implementation**:
- T010 (FactionSelector) and T014 (PointBudgetInput) can run in parallel (different files)
- T011 (expansion state) and T015 (custom input) can run in parallel

**User Story 2 Tests (if TDD)**:
- T026, T027, T028 can run in parallel

**User Story 2 Implementation**:
- T029 (UnitSelector stub) and T036 (unit cost display) can run in parallel
- T031 (budget calc) and T037 (mobile images) can run in parallel

**User Story 3 Tests (if TDD)**:
- T044, T045, T046 can run in parallel

**User Story 3 Implementation**:
- T047 (handleEnterBattle) and T048 (handleEndBattle) can run in parallel
- T053 (GameSession extension) and T057 (confirmation dialog) can run in parallel

**Polish Phase (Phase 6)**:
- T058, T059, T060, T061, T062, T063 can all run in parallel (different files/components)
- T065, T066 can run in parallel (mobile checks)
- T069, T070, T071, T072, T073, T074, T075, T076, T077 are manual tests (can run in any order)

**Cross-Story Parallelization**:
- Once Foundational phase completes, US1, US2, and US3 can all be worked on in parallel by different developers
- Each story modifies different files (US1: FactionSelector, PointBudgetInput; US2: UnitSelector; US3: GameSession, callbacks)

---

## Parallel Example: User Story 1

```bash
# Launch all test stubs together:
Task: "T007 Test faction selection renders all factions"
Task: "T008 Test point budget preset buttons work"
Task: "T009 Test custom point input validation"

# Launch component implementations together:
Task: "T010 Implement FactionSelector component with card-based layout"
Task: "T014 Implement PointBudgetInput component with preset buttons"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - CRITICAL
3. Complete Phase 3: User Story 1 (T007-T025)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Can select faction and see details
   - Can set point budget (preset or custom)
   - Selection persists to next step
   - Mobile: Touch targets work, cards visible
5. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Faction & Budget selection!)
3. Add User Story 2 → Test independently → Deploy/Demo (Add: Unit selection with budget!)
4. Add User Story 3 → Test independently → Deploy/Demo (Add: Battle lockout!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (FactionSelector, PointBudgetInput)
   - **Developer B**: User Story 2 (UnitSelector)
   - **Developer C**: User Story 3 (GameSession lockout, callbacks)
3. Stories complete and integrate independently
4. Team converges for Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2], [US3] labels map tasks to user stories for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if following TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Russian UI text required per Constitution Principle I
- Mobile-first required per Constitution Principle VI (44x44px targets, visible images)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

- **Total Tasks**: 81
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 3 tasks (BLOCKS all stories)
- **User Story 1**: 19 tasks (tests: 3, implementation: 16)
- **User Story 2**: 18 tasks (tests: 3, implementation: 15)
- **User Story 3**: 14 tasks (tests: 3, implementation: 11)
- **Polish Phase**: 24 tasks (including mobile verification)

**Parallel Opportunities**: 25+ tasks marked [P] can run in parallel

**MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = 25 tasks

**Independent Test Criteria**:
- US1: Select faction, set budget, verify persistence
- US2: Add/remove units, verify budget tracking
- US3: Enter battle, verify lockout, exit battle
