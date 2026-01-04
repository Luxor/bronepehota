# Feature Specification: Army Building Flow

**Feature Branch**: `001-army-building-flow`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "На первой странице пользвоателей выбирает фракцию и видит краткую информацию о ней. Также вводится коль-во очков достуных для набора армии. Можно выставить набор стандартных значнений 250, 350, 500 и 1000 оставив возможноть произвольного выбора. На втором шаге выбираем юниты исходя из кол-ва очков выбранных ранее. Армия собрана, переходим в фазу боя. Из фазы боя можно вернутся только завершив бой. Донабрать армию нельзя"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Faction Selection and Point Budget (Priority: P1)

Player selects a faction for their army and sets the point budget for army construction. They see brief information about each faction to help them choose.

**Why this priority**: This is the foundational step that enables all subsequent army building. Without selecting a faction and point budget, no units can be added.

**Independent Test**: Can be tested by selecting each faction, verifying faction information displays correctly, choosing point values (preset and custom), and confirming the selection persists to the next step.

**Acceptance Scenarios**:

1. **Given** player is on the faction selection screen, **When** they tap on a faction, **Then** brief faction information is displayed (name, description, motto, homeworld, color)
2. **Given** player has selected a faction, **When** they choose a point preset (250, 350, 500, 1000), **Then** the selected point value is set as the army budget
3. **Given** player has selected a faction, **When** they enter a custom point value, **Then** that value is set as the army budget
4. **Given** player has selected a faction and set point budget, **When** they proceed to the next step, **Then** the faction and point budget are preserved
5. **Given** player is on faction selection screen, **When** they view it on mobile, **Then** faction cards are clearly visible with touch-friendly targets

---

### User Story 2 - Unit Selection Within Point Budget (Priority: P2)

Player selects units for their army from the chosen faction, staying within the point budget established in step one. The system tracks remaining points and prevents over-budget selections.

**Why this priority**: This is the core army building experience. Players must be able to select units while understanding their point constraints.

**Independent Test**: Can be tested by selecting various units, verifying point calculations, adding/removing units, and confirming budget enforcement works correctly.

**Acceptance Scenarios**:

1. **Given** player has chosen a faction and point budget, **When** they view available units, **Then** only units for that faction are displayed with their point costs
2. **Given** player is viewing units, **When** they add a unit within the remaining budget, **Then** the unit is added to the army and remaining points decrease
3. **Given** player is viewing units, **When** they attempt to add a unit that exceeds remaining points, **Then** the system prevents the addition and shows a budget warning
4. **Given** player has added units, **When** they remove a unit, **Then** the unit is removed and remaining points increase accordingly
5. **Given** player is building their army on mobile, **Then** unit images are clearly visible for identification

---

### User Story 3 - Battle Phase Lockout (Priority: P3)

Player transitions to battle phase after completing army construction. During battle, returning to army building is disabled until the battle is concluded.

**Why this priority**: This ensures game integrity by preventing army modifications during an active battle session. It's lower priority because the core army building (P1, P2) must work first.

**Independent Test**: Can be tested by completing army construction, entering battle phase, attempting to return to army builder, and verifying the lockout works. Then complete battle and verify return becomes available.

**Acceptance Scenarios**:

1. **Given** player has completed army construction, **When** they choose to enter battle phase, **Then** the battle interface is displayed with the constructed army
2. **Given** player is in battle phase, **When** they attempt to return to army builder, **Then** the option is disabled or not visible
3. **Given** player is in battle phase, **When** they complete or end the battle, **Then** they can return to army builder with the option to start a new army
4. **Given** player ended a battle, **When** they return to army building, **Then** they start fresh with no pre-loaded units (donabór армии нельзя)

---

### Edge Cases

- What happens when player enters invalid point values (negative, zero, extremely large)? → **System shows inline error message "Введите число от 1 до 10000" and disables Next button**
- What happens when player selects no faction and tries to proceed? → **Next button is disabled, visual cue indicating faction selection required**
- What happens when point budget is exactly equal to unit cost (boundary condition)? → **Unit can be added (inclusive boundary), remaining points becomes zero**
- What happens when all units in the faction exceed the point budget? → **Empty state message "Нет доступных юнитов" displayed, no units can be added**
- What happens if session is interrupted (browser close, refresh) during army building? → **State restores from localStorage; user returns to the same step with all selections preserved**
- What happens when faction data is incomplete or missing? → **Error message "Ошибка загрузки данных" displayed, option to retry**
- What happens when custom point value equals a preset value (250, 350, 500, 1000)? → **Treated as custom input (no special handling, preset buttons reset when custom value entered)**
- What happens when player switches factions after selecting units? → **Confirmation dialog: "Сменить фракцию? Выбранные юниты будут очищены" – clearing selected units if confirmed**
- What happens when localStorage is corrupted or unavailable? → **Graceful degradation with warning, starts fresh**
- What happens when user refreshes during battle phase? → **Remains in battle phase, lockout persists**
- What happens when network request for faction/squad data fails? → **Error toast "Ошибка загрузки данных", retry button provided**

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all available factions (polaris, protectorate, mercenaries) on the first screen
- **FR-002**: System MUST display brief faction information when faction is selected or highlighted (name, description, motto, homeworld, color)
- **FR-003**: System MUST provide preset point budget options: 250, 350, 500, and 1000
- **FR-004**: System MUST allow custom point budget input (arbitrary positive number)
- **FR-005**: System MUST validate point budget input (must be positive number, range 1-10000)
- **FR-006**: System MUST display only units belonging to the selected faction
- **FR-007**: System MUST display point cost for each unit
- **FR-008**: System MUST track total army cost and remaining points
- **FR-009**: System MUST prevent adding units that exceed remaining point budget
- **FR-010**: System MUST display clear warning when unit cannot be added due to budget
- **FR-011**: System MUST allow removing units from the army
- **FR-012**: System MUST update remaining points when units are added or removed
- **FR-013**: System MUST provide transition to battle phase after army construction
- **FR-014**: System MUST disable return to army builder during active battle phase
- **FR-015**: System MUST enable return to army builder only after battle conclusion
- **FR-016**: System MUST start fresh army construction after battle (no pre-loaded units)
- **FR-017**: System MUST persist army state during session (refresh/resume support)
- **FR-018**: System MUST display soldier/unit images clearly on mobile for identification
- **FR-019**: System MUST be touch-friendly on mobile (44x44px minimum tap targets, 48x48px for add/remove buttons)
- **FR-020**: All UI text MUST be in Russian
- **FR-021**: System MUST provide loading state indicators for faction and squad data fetching
- **FR-022**: System MUST support keyboard navigation for all interactive elements (Tab, Arrow keys, Enter to select)
- **FR-023**: System MUST manage focus when transitioning between steps (faction-select → unit-select → battle)
- **FR-024**: System MUST provide ARIA labels for all interactive elements (screen reader support)
- **FR-025**: System MUST use Tailwind CSS breakpoints: mobile (<768px), tablet (768px-1024px), desktop (>1024px)
- **FR-026**: System MUST display text truncation with ellipsis for long faction names on mobile
- **FR-027**: System MUST provide visual feedback for all interactive states (hover, focus, active, disabled, selected)
- **FR-028**: System MUST display error messages inline near related input fields with Russian text

### Key Entities

- **Faction**: Represents a playable faction with unique identity (id, name, description, motto, homeworld, color)
- **Point Budget**: The maximum point limit for army construction (preset or custom value)
- **Unit/Squad**: Individual unit that can be added to army (id, name, faction, cost, soldiers, image)
- **Army**: Collection of selected units with total cost tracking against point budget
- **Battle Session**: Active gameplay session with lockout on army modification

## Assumptions

1. Standard game point values are 250, 350, 500, and 1000 based on common wargame conventions
2. Faction data is complete and available from the data layer
3. Player starts fresh after each battle (no save/load of army compositions)
4. Session persistence uses browser storage for continuity during refresh
5. "Complete battle" means player explicitly ends the battle session
6. Custom point values can be any reasonable positive integer (e.g., 1-10000 range)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete faction selection and point budget setup in under 30 seconds
- **SC-002**: Players can build a complete army within their point budget in under 5 minutes
- **SC-003**: 95% of players successfully understand point budget constraints without external help (validated by user testing with 10 participants)
- **SC-004**: Zero cases of players accidentally exceeding point budget (system prevents it)
- **SC-005**: Battle phase lockout prevents 100% of unauthorized army modifications
- **SC-006**: Army state persists correctly across page refresh (no data loss)
- **SC-007**: All faction information displays correctly on mobile and desktop (validated on iPhone 12 and Samsung Galaxy S21)
- **SC-008**: Unit images are identifiable on mobile for 90% of users (validated by user testing with 10 participants)
- **SC-009**: All tap targets meet 44x44px minimum on mobile (validated by DevTools inspection on mobile emulation)
- **SC-010**: Color contrast ratios meet WCAG AA standard for all faction colors (validated by color contrast checker)
- **SC-011**: All interactive elements are keyboard navigable (validated by keyboard-only user testing)
- **SC-012**: Loading states display within 200ms for data fetching operations
