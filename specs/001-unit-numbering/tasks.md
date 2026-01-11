---

description: "Task list for feature implementation"
---

# Tasks: Unit Numbering and Count Display

**Input**: Design documents from `/specs/001-unit-numbering/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as specified in the constitution and quickstart documentation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create unit-utils.ts file structure in src/lib/unit-utils.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add instanceNumber field to ArmyUnit interface in src/lib/types.ts
- [x] T003 [P] Implement countByUnitType function in src/lib/unit-utils.ts
- [x] T004 [P] Implement getNextInstanceNumber function in src/lib/unit-utils.ts
- [x] T005 [P] Implement canAddUnit function in src/lib/unit-utils.ts
- [x] T006 [P] Implement validateAddUnit function in src/lib/unit-utils.ts
- [x] T007 [P] Implement formatUnitNumber function in src/lib/unit-utils.ts
- [x] T008 [P] Implement formatCountBadge function in src/lib/unit-utils.ts
- [x] T009 [P] Implement assignInstanceNumber function in src/lib/unit-utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Display Unit Count During Selection (Priority: P1) 🎯 MVP

**Goal**: Show count badges on "Add" buttons to display how many units of each type are already in the army

**Independent Test**: Select a faction, browse units, verify each unit card displays correct count (0 if none, number if added). Add/remove units and verify counts update immediately.

### Tests for User Story 1

- [x] T010 [P] [US1] Test countByUnitType with empty array in src/__tests__/unit-numbering.test.ts
- [x] T011 [P] [US1] Test countByUnitType with multiple unit types in src/__tests__/unit-numbering.test.ts
- [x] T012 [P] [US1] Test canAddUnit at 99 limit in src/__tests__/unit-numbering.test.ts
- [x] T013 [P] [US1] Test canAddUnit under 99 in src/__tests__/unit-numbering.test.ts
- [x] T014 [P] [US1] Test validateAddUnit with Russian error message in src/__tests__/unit-numbering.test.ts
- [x] T015 [P] [US1] Test formatCountBadge with 0 returns null in src/__tests__/unit-numbering.test.ts
- [x] T016 [P] [US1] Test formatCountBadge with positive number in src/__tests__/unit-numbering.test.ts

### Implementation for User Story 1

- [x] T017 [US1] Add unitCounts memoized state to ArmyBuilder component in src/components/ArmyBuilder.tsx
- [x] T018 [US1] Add count badge styling to "Add" buttons in ArmyBuilder component in src/components/ArmyBuilder.tsx
- [x] T019 [US1] Implement 99-unit limit validation with error display in ArmyBuilder component in src/components/ArmyBuilder.tsx
- [x] T020 [US1] Add count badges to UnitSelector component in src/components/UnitSelector.tsx
- [x] T021 [US1] Update addUnit function to use validateAddUnit in ArmyBuilder component in src/components/ArmyBuilder.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Unique Unit Number Assignment (Priority: P2)

**Goal**: Assign sequential numbers (#1, #2, etc.) to each unit when added to the army

**Independent Test**: Add multiple units of the same type and verify each receives the next sequential number. Remove a unit and verify new units continue with next number (no reuse).

### Tests for User Story 2

- [x] T022 [P] [US2] Test getNextInstanceNumber for new type returns 1 in src/__tests__/unit-numbering.test.ts
- [x] T023 [P] [US2] Test getNextInstanceNumber for existing type returns count+1 in src/__tests__/unit-numbering.test.ts
- [x] T024 [P] [US2] Test formatUnitNumber with instanceNumber in src/__tests__/unit-numbering.test.ts
- [x] T025 [P] [US2] Test formatUnitNumber without instanceNumber uses fallback in src/__tests__/unit-numbering.test.ts

### Implementation for User Story 2

- [x] T026 [US2] Update addUnit function to assign instanceNumber in ArmyBuilder component in src/components/ArmyBuilder.tsx
- [x] T027 [US2] Display instanceNumber in UnitCard header in src/components/UnitCard.tsx
- [x] T028 [US2] Ensure unit numbers persist during save/load operations in ArmyBuilder component in src/components/ArmyBuilder.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Unit Numbers in Combat Phase (Priority: P3)

**Goal**: Display unit numbers during combat phase for easy identification

**Independent Test**: Enter combat mode with multiple units of the same type, verify each displays its unique number. Export/import army and verify numbers are preserved.

### Tests for User Story 3

- [x] T029 [P] [US3] Test export preserves instanceNumber in src/__tests__/unit-numbering.test.ts
- [x] T030 [P] [US3] Test import handles missing instanceNumber (backward compatibility) in src/__tests__/unit-numbering.test.ts

### Implementation for User Story 3

- [x] T031 [US3] Update GameSession to use formatUnitNumber instead of array index in src/components/GameSession.tsx
- [x] T032 [US3] Ensure unit numbers are visible in unit navigation during combat in GameSession component in src/components/GameSession.tsx
- [x] T033 [US3] Update UnitDetailsModal to show unit count if applicable in src/components/UnitDetailsModal.tsx (N/A - modal shows template, not army instance)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T034 [P] Add mobile touch target validation (44x44px minimum) to all buttons with badges
- [x] T035 [P] Verify badge visibility on mobile viewport in ArmyBuilder component
- [x] T036 [P] Add error message auto-dismiss after 3 seconds in ArmyBuilder component
- [x] T037 [P] Code cleanup and ensure no console errors in all modified components
- [x] T038 [P] Run all unit-numbering tests to ensure 100% pass rate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on instanceNumber field from Phase 2
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on formatUnitNumber from Phase 2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utility functions before component implementation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (T003-T009)
- All tests for a user story marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Test countByUnitType with empty array in src/__tests__/unit-numbering.test.ts"
Task: "Test countByUnitType with multiple unit types in src/__tests__/unit-numbering.test.ts"
Task: "Test canAddUnit at 99 limit in src/__tests__/unit-numbering.test.ts"
Task: "Test canAddUnit under 99 in src/__tests__/unit-numbering.test.ts"
Task: "Test validateAddUnit with Russian error message in src/__tests__/unit-numbering.test.ts"
Task: "Test formatCountBadge with 0 returns null in src/__tests__/unit-numbering.test.ts"
Task: "Test formatCountBadge with positive number in src/__tests__/unit-numbering.test.ts"

# Launch all utility functions together (Phase 2):
Task: "Implement countByUnitType function in src/lib/unit-utils.ts"
Task: "Implement getNextInstanceNumber function in src/lib/unit-utils.ts"
Task: "Implement canAddUnit function in src/lib/unit-utils.ts"
Task: "Implement validateAddUnit function in src/lib/unit-utils.ts"
Task: "Implement formatUnitNumber function in src/lib/unit-utils.ts"
Task: "Implement formatCountBadge function in src/lib/unit-utils.ts"
Task: "Implement assignInstanceNumber function in src/lib/unit-utils.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence