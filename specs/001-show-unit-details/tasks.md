# Tasks: Show Unit Details in Army Builder

**Input**: Design documents from `/specs/001-show-unit-details/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Tests are NOT included for this UI-only feature (no explicit test request in spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js web application: `src/` at repository root
- Components: `src/components/`
- Types: `src/lib/types.ts` (existing, no changes)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed - using existing project structure

This feature adds to an existing Next.js application. No new dependencies, configuration, or infrastructure setup is required.

- [X] T001 Verify branch `001-show-unit-details` is checked out
- [X] T002 Verify existing project structure matches plan.md (src/components/, src/lib/, src/data/)

**Checkpoint**: Setup verified - ready to begin implementation

---

## Phase 2: Foundational (Modal Base Component)

**Purpose**: Create the base modal component that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create UnitDetailsModal component shell in src/components/UnitDetailsModal.tsx with props interface (unit, unitType, faction, isOpen, onClose)
- [X] T004 Implement modal overlay with backdrop (fixed position, z-index, backdrop blur) in src/components/UnitDetailsModal.tsx
- [X] T005 Implement modal close button (X icon, top-right, minimum 44x44px) in src/components/UnitDetailsModal.tsx
- [X] T006 Add click-outside-to-close functionality (backdrop click handler) in src/components/UnitDetailsModal.tsx
- [X] T007 Add Escape key to close functionality (keyboard event listener) in src/components/UnitDetailsModal.tsx
- [X] T008 Implement body scroll lock when modal opens (useEffect for overflow:hidden) in src/components/UnitDetailsModal.tsx
- [X] T009 Add ARIA attributes for accessibility (role="dialog", aria-modal="true") in src/components/UnitDetailsModal.tsx
- [X] T010 Implement responsive modal container (full-screen mobile, centered card desktop with max-w-2xl) in src/components/UnitDetailsModal.tsx
- [X] T011 Add modal open/close animations (fade-in/scale-in with CSS transitions) in src/components/UnitDetailsModal.tsx
- [X] T012 Add modal header section (title, faction color styling) in src/components/UnitDetailsModal.tsx
- [X] T013 Add modal content scrollable area (overflow-y-auto, responsive padding) in src/components/UnitDetailsModal.tsx

**Checkpoint**: Modal base component ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Squad Soldier Details (Priority: P1) 🎯 MVP

**Goal**: Display detailed soldier information (rank, speed, range, power, melee, armor, props) for all soldiers in a squad when user clicks on squad card

**Independent Test**: Click on any squad card → modal opens → all 6 soldiers display with full stats → user can close modal → filters/search preserved

### Implementation for User Story 1

- [X] T014 [P] [US1] Create SoldierStats subcomponent in src/components/UnitDetailsModal.tsx to display individual soldier stats in grid layout
- [X] T015 [P] [US1] Implement soldier stat display items (rank, speed, range, power, melee, armor) with icons in src/components/UnitDetailsModal.tsx
- [X] T016 [US1] Implement special properties (props) display as badges with visual highlighting in src/components/UnitDetailsModal.tsx
- [X] T017 [US1] Add tooltip/popover for special property explanation (e.g., "Г" - граната) in src/components/UnitDetailsModal.tsx
- [X] T018 [P] [US1] Implement soldier image display alongside stats (if present) in src/components/UnitDetailsModal.tsx
- [X] T019 [US1] Add image error handling with placeholder display in src/components/UnitDetailsModal.tsx
- [X] T020 [US1] Render squad soldiers list (map through soldiers array) in src/components/UnitDetailsModal.tsx
- [X] T021 [US1] Add empty state message when soldiers array is empty in src/components/UnitDetailsModal.tsx
- [X] T022 [US1] Add click handler to squad cards in ArmyBuilder.tsx (existing component) to open modal with squad data
- [X] T023 [US1] Add modal state management (selectedUnit, isModalOpen) to ArmyBuilder.tsx
- [X] T024 [US1] Import and render UnitDetailsModal in ArmyBuilder.tsx
- [X] T025 [US1] Verify Russian language for all modal UI text elements in src/components/UnitDetailsModal.tsx

**Checkpoint**: User Story 1 complete - squad soldier details viewable via modal

---

## Phase 4: User Story 2 - View Machine Weapon and Durability Details (Priority: P1)

**Goal**: Display detailed machine information (rank, fire_rate, ammo, durability, speed_sectors, weapons) when user clicks on machine card

**Independent Test**: Click on any machine card → modal opens → basic stats, speed sectors table, all weapons display → user can close modal

### Implementation for User Story 2

- [X] T026 [P] [US2] Create MachineStats subcomponent in src/components/UnitDetailsModal.tsx to display basic machine stats in grid layout
- [X] T027 [P] [US2] Implement machine stat display items (rank, fire_rate, ammo_max, durability_max) with icons in src/components/UnitDetailsModal.tsx
- [X] T028 [P] [US2] Create SpeedSectorsTable subcomponent in src/components/UnitDetailsModal.tsx to display speed ranges in table format
- [X] T029 [US2] Implement speed sector display (min-max durability range, speed value) in src/components/UnitDetailsModal.tsx
- [X] T030 [US2] Add empty state message when speed_sectors array is empty in src/components/UnitDetailsModal.tsx
- [X] T031 [P] [US2] Create WeaponCard subcomponent in src/components/UnitDetailsModal.tsx to display individual weapon details
- [X] T032 [US2] Implement weapon display (name, range, power, special rules) in src/components/UnitDetailsModal.tsx
- [X] T033 [US2] Add dice notation formatting (monospace font) for range/power in src/components/UnitDetailsModal.tsx
- [X] T034 [US2] Render machine weapons list (map through weapons array) in src/components/UnitDetailsModal.tsx
- [X] T035 [US2] Add empty state message when weapons array is empty in src/components/UnitDetailsModal.tsx
- [X] T036 [US2] Implement machine image display in modal header (if present) in src/components/UnitDetailsModal.tsx
- [X] T037 [US2] Add conditional rendering logic (squad vs machine view) in src/components/UnitDetailsModal.tsx based on unitType prop
- [X] T038 [US2] Add click handler to machine cards in ArmyBuilder.tsx to open modal with machine data
- [X] T039 [US2] Update modal state management to handle unitType ('squad' | 'machine') in ArmyBuilder.tsx

**Checkpoint**: User Story 2 complete - machine weapon and durability details viewable via modal

---

## Phase 5: User Story 3 - Compare Units Side by Side (Priority: P2)

**Goal**: Allow users to switch between units without closing modal, updating content dynamically

**Independent Test**: Open unit A details → click unit B card → modal updates with unit B content → close modal → filters/search preserved

### Implementation for User Story 3

- [X] T040 [US3] Update handleUnitClick in ArmyBuilder.tsx to update selectedUnit when modal is already open
- [X] T041 [US3] Add animation/transition when switching between units in src/components/UnitDetailsModal.tsx
- [X] T042 [US3] Verify state preservation (filters, search, selected units list) when modal opens/closes in ArmyBuilder.tsx
- [X] T043 [US3] Test rapid unit switching (debounce if needed) in ArmyBuilder.tsx

**Checkpoint**: User Story 3 complete - users can compare units by switching modal content

---

## Phase 6: User Story 4 - Mobile-Optimized Unit Details View (Priority: P2)

**Goal**: Ensure modal is fully functional and optimized for mobile devices (touch, scroll, readability)

**Independent Test**: Open on mobile device/emulator → modal is full-screen → all content readable with vertical scroll only → close button tappable (44x44px)

### Implementation for User Story 4

- [X] T044 [P] [US4] Verify modal is full-screen on mobile (<768px breakpoint) in src/components/UnitDetailsModal.tsx
- [X] T045 [P] [US4] Verify close button is minimum 44x44px on mobile in src/components/UnitDetailsModal.tsx
- [X] T046 [P] [US4] Ensure all content scrolls vertically only (no horizontal scroll) in src/components/UnitDetailsModal.tsx
- [X] T047 [P] [US4] Verify text is readable on mobile (minimum 14px, appropriate line height) in src/components/UnitDetailsModal.tsx
- [X] T048 [P] [US4] Test long weapon names handling (truncate with ellipsis) in src/components/UnitDetailsModal.tsx
- [X] T049 [US4] Add swipe-down gesture to close modal on mobile (optional enhancement) in src/components/UnitDetailsModal.tsx
- [X] T050 [US4] Verify touch feedback (active/pressed states) on interactive elements in src/components/UnitDetailsModal.tsx
- [X] T051 [US4] Test modal on actual mobile device or DevTools emulation in browser

**Checkpoint**: User Story 4 complete - modal fully optimized for mobile experience

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final polish

- [X] T052 [P] Add empty state handling for invalid data (negative stats, empty strings) in src/components/UnitDetailsModal.tsx
- [X] T053 [P] Add visual error indication for negative stat values (red color) in src/components/UnitDetailsModal.tsx
- [X] T054 Implement rapid open/close debounce (prevent animation conflicts) in src/components/UnitDetailsModal.tsx
- [X] T055 Add focus management (focus trap in modal, restore focus on close) in src/components/UnitDetailsModal.tsx
- [X] T056 Verify all Russian text is complete and accurate in src/components/UnitDetailsModal.tsx
- [X] T057 Run TypeScript compilation to verify no type errors (npm run build)
- [X] T058 Run linter to check code quality (npm run lint)
- [X] T059 Manual testing: test all user stories on desktop and mobile
- [X] T060 Verify constitution compliance (44x44px touch targets, Russian UI, mobile-first)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No dependencies on Setup - this is the actual implementation start
- **User Stories (Phase 3-6)**: All depend on Foundational (Phase 2) completion
  - US1 and US2 are independent and can proceed in parallel
  - US3 depends on US1 OR US2 (needs modal content working)
  - US4 can proceed in parallel with US1-US3 (mobile optimization is separate concern)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P2)**: Requires US1 or US2 to be complete (modal content must exist)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, applies to all stories

### Within Each User Story

- Parallel tasks ([P]) can be executed simultaneously
- Sequential tasks must complete in order
- Test after each user story completion

### Parallel Opportunities

- **Foundational Phase**: T003-T013 have some parallel opportunities (modal structure, close handlers, responsiveness)
- **User Story 1**: T014, T015, T018, T025 can run in parallel (different aspects of soldier display)
- **User Story 2**: T026-T030, T031-T033 can run in parallel (stats, speed sectors, weapons are separate concerns)
- **User Story 4**: T044-T048 can all run in parallel (different mobile aspects to verify)
- **User Story level**: US1 and US2 can be developed in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch these tasks together (different subcomponents):
Task: "Create SoldierStats subcomponent in src/components/UnitDetailsModal.tsx"
Task: "Implement soldier stat display items in src/components/UnitDetailsModal.tsx"
Task: "Add tooltip/popover for special property explanation in src/components/UnitDetailsModal.tsx"
Task: "Verify Russian language for all modal UI text elements in src/components/UnitDetailsModal.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch these tasks together (independent display sections):
Task: "Create MachineStats subcomponent in src/components/UnitDetailsModal.tsx"
Task: "Create SpeedSectorsTable subcomponent in src/components/UnitDetailsModal.tsx"
Task: "Create WeaponCard subcomponent in src/components/UnitDetailsModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (modal base component)
2. Complete Phase 3: User Story 1 (squad soldier details)
3. **STOP and VALIDATE**: Test clicking squad card → modal opens → soldiers display → close modal
4. Polish mobile responsiveness if needed

**MVP Delivers**: Users can view squad soldier details before deciding to add to army

### Incremental Delivery

1. Phase 2 (Foundational) → Modal base component ready
2. Add Phase 3 (US1) → Squad details work → Test independently → MVP complete!
3. Add Phase 4 (US2) → Machine details work → Test independently
4. Add Phase 6 (US4) → Mobile optimized → Test on mobile
5. Add Phase 5 (US3) → Unit comparison → Test independently
6. Phase 7 (Polish) → Final polish and edge cases

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 2 (Foundational) together
2. Once Phase 2 is done:
   - Developer A: User Story 1 (squad details)
   - Developer B: User Story 2 (machine details)
   - Developer C: User Story 4 (mobile optimization)
3. Stories integrate independently via shared modal component
4. Phase 5 (US3) starts after US1 or US2 complete
5. Phase 7 (Polish) done together or by one developer

---

## Notes

- [P] tasks = different files/components or non-conflicting changes
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No game logic or data layer changes - this is a pure UI feature
- All existing types from `src/lib/types.ts` are used - no new types needed
- Constitution compliance: Russian UI (Principle I), Mobile-First (Principle VI)
