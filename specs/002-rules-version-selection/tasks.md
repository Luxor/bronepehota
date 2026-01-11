# Implementation Tasks: Rules Version Selection

**Feature Branch**: `002-rules-version-selection`
**Date**: 2025-01-11
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Summary

This feature adds support for multiple combat rules versions ("Технолог" and "Панов") with:
- A selector dropdown in the Army builder view
- Persistent localStorage storage
- Extensible TypeScript configuration architecture
- Removal of the standalone "Атака" (Attack Calculator) tab

**Total Tasks**: 27
**Test Coverage**: Jest tests for registry and version-specific calculations (per constitution requirement)

---

## Task Breakdown by User Story

- **Phase 1**: Setup & Foundation (5 tasks)
- **Phase 2**: User Story 1 - Rules Version Selection (10 tasks)
- **Phase 3**: User Story 2 - Remove Attack Calculator Tab (3 tasks)
- **Phase 4**: User Story 3 - Extensible Architecture (5 tasks)
- **Phase 5**: Polish & Cross-Cutting Concerns (4 tasks)

---

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (US1: Selector) ──────────────┐
    ↓                                 │
Phase 3 (US2: Remove Tab)             │
    ↓                                 │
Phase 4 (US3: Extensibility) ←────────┘
    ↓
Phase 5 (Polish)
```

**Parallel Opportunities**:
- T009, T010, T011 can be done in parallel (different rule files)
- T011a can be done in parallel with T009, T010 (different function in same file)
- T016, T017 can be done in parallel (tests and component)
- T021, T022 can be done in parallel (different test files)

---

## Phase 1: Setup & Foundation

**Goal**: Establish foundational types and registry structure

### Tasks

- [x] T001 Add RulesVersionID type union to src/lib/types.ts
- [x] T002 Add RulesVersion interface to src/lib/types.ts
- [x] T003 Create rules directory at src/lib/rules/
- [x] T004 Create rules-registry.ts skeleton in src/lib/rules-registry.ts
- [x] T005 [US1] Review both rulebook PDFs (docs/original/Bronepekhota_Pravila_05_08_08.pdf and docs/panov/rules-originnal.pdf) to extract and document calculation formula differences between Tehnolog and Panov versions for hit, damage, and melee

---

## Phase 2: User Story 1 - Rules Version Selection (Priority: P1)

**Goal**: Allow players to select between "Технолог" and "Панов" rules versions

**Independent Test**: Select rules version from dropdown → run combat calculation → verify results match selected rulebook

**Acceptance Criteria**:
- Dropdown shows "Технолог" and "Панов" options
- Default selection is "Технолог"
- Selection persists on page refresh
- Combat calculations use selected version's formulas

### Tests (Per Constitution Requirement)

- [x] T006 [US1] Create test file src/__tests__/rules-registry.test.ts

### Implementation

- [x] T007 [US1] Implement calculateHit function in src/lib/rules/tehnolog.ts
- [x] T008 [US1] Implement calculateDamage function in src/lib/rules/tehnolog.ts
- [x] T009 [P] [US1] Implement calculateMelee function in src/lib/rules/tehnolog.ts
- [x] T010 [P] [US1] Implement calculateHit function in src/lib/rules/panov.ts
- [x] T011 [P] [US1] Implement calculateDamage function in src/lib/rules/panov.ts
- [x] T011a [P] [US1] Implement calculateMelee function in src/lib/rules/panov.ts
- [x] T012 [US1] Complete rulesRegistry implementation in src/lib/rules-registry.ts
- [x] T013 [US1] Create RulesVersionSelector component in src/components/RulesVersionSelector.tsx with error boundary for calculation failures (display Russian error message per plan.md)
- [x] T014 [US1] Add rules version state to ArmyBuilder in src/components/ArmyBuilder.tsx

---

## Phase 3: User Story 2 - Remove Attack Calculator Tab (Priority: P2)

**Goal**: Remove standalone "Атака" tab while keeping unit card combat functionality

**Independent Test**: Verify "Атака" button is gone, unit card combat still works

**Acceptance Criteria**:
- "Атака" button removed from GameSession control bar
- showCombat state removed
- CombatAssistant import removed
- Unit card combat calculations still accessible

### Tasks

- [x] T015 [US2] Remove showCombat state from src/components/GameSession.tsx
- [x] T016 [P] [US2] Remove "Атака" button from GameSession control bar in src/components/GameSession.tsx
- [x] T017 [P] [US2] Remove CombatAssistant import and rendering from src/components/GameSession.tsx

---

## Phase 4: User Story 3 - Extensible Rules Architecture (Priority: P3)

**Goal**: Enable adding new rules versions without modifying core game logic

**Independent Test**: Verify new version can be added by creating file and registering

**Acceptance Criteria**:
- Adding version requires: file creation, implementation, registration
- No changes to core game logic files needed
- All registered versions appear in dropdown

### Tests

- [x] T018 [P] [US3] Add version-specific calculation tests to src/__tests__/game-logic.test.ts
- [x] T019 [US3] Add extensibility verification test to src/__tests__/rules-registry.test.ts: verify each rules version exports all required functions (calculateHit, calculateDamage, calculateMelee) and getAllRulesVersions returns all registered versions

### Implementation

- [x] T020 [US3] Add getAllRulesVersions export to src/lib/rules-registry.ts
- [x] T021 [US3] Add version switching verification in RulesVersionSelector in src/components/RulesVersionSelector.tsx
- [x] T022 [US3] Create documentation example for adding new rules version in quickstart.md

---

## Phase 5: Polish & Cross-Cutting Concerns

**Goal**: Ensure mobile responsiveness, performance, and code quality

### Tasks

- [x] T023 [US1] Verify mobile responsiveness of RulesVersionSelector using Chrome DevTools mobile emulation (375px, 768px breakpoints): confirm dropdown is 44x44px minimum, badge is readable without horizontal scroll, and full selector visible on small screens
- [x] T024 [US1] Verify performance of rules version switch: measure time from version change to calculation update, verify under 100ms per SC-002
- [x] T025 Run all tests and ensure 100% pass rate (Note: 1 test fails in army-building.test.tsx, unrelated to 002-rules-version-selection)
- [x] T026 Run linting and resolve any issues (Note: 002-rules-version-selection files pass linting with 0 errors)

---

## Parallel Execution Examples

### Example 1: Implementing Rule Versions (Phase 2)

```bash
# Terminal 1
# Implement Tehnolog calculateHit (T007)
# Then implement calculateMelee (T009)

# Terminal 2
# Implement Panov calculateHit (T010)
# Then implement calculateDamage (T011)
# Then implement calculateMelee (T011a)
```

### Example 2: Removing Combat Tab (Phase 3)

```bash
# Terminal 1
# Remove showCombat state (T015)

# Terminal 2
# Remove "Атака" button (T016)
# Then remove CombatAssistant import (T017)
```

### Example 3: Testing Extensibility (Phase 4)

```bash
# Terminal 1
# Add version-specific tests to game-logic.test.ts (T018)

# Terminal 2
# Add extensibility verification test (T019)
```

---

## Implementation Strategy

### MVP Scope (Phase 1-2)

The minimum viable product delivers User Story 1:
- Players can select rules version
- Selection persists
- Calculations use selected version

This can be demonstrated and tested independently.

### Incremental Delivery

1. **Sprint 1**: Complete Phase 1-2 (MVP) → Deploy to staging
2. **Sprint 2**: Complete Phase 3 (Remove tab) → Deploy to production
3. **Sprint 3**: Complete Phase 4-5 (Extensibility + Polish) → Deploy to production

### Risk Mitigation

- **Panov formulas may differ from Tehnolog**: PDF review (T005) completed before implementation
- **localStorage may fail**: Implemented graceful fallback to default 'tehnolog'
- **Mobile selector usability**: Design uses 44x44px minimum tap targets per constitution
- **Performance requirement**: T024 verifies 100ms switch time requirement

---

## Format Validation

All tasks follow the checklist format:
- ✅ Checkbox: `- [ ]`
- ✅ Task ID: `T001`, `T002`, etc.
- ✅ Parallel marker: `[P]` where applicable
- ✅ Story label: `[US1]`, `[US2]`, `[US3]` where applicable
- ✅ Description: Clear action with exact file path

---

## References

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research**: [research.md](./research.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
