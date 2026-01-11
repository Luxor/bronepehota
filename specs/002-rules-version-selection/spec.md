# Feature Specification: Rules Version Selection

**Feature Branch**: `002-rules-version-selection`
**Created**: 2025-01-11
**Status**: Draft
**Input**: User description: "Существуют две версии правил для игры. От Технолога Bronepekhota_Pravila_05_08_08.pdf и фанатская от Панова rules-originnal.pdf (правила находиятся в поддеррикториях doc/*). Надо давать восможность игроку выбрать по какой версии он собирается играть. После выбора, бой должен расчитыватся согласно выбранной версии. Расширь текущию инпленментацию с возможностью расширения новых версий правил в будущем. Вкладка "Расчёт Атаки" больше не нужна, не надо её подерживать и надо удалить. Все данные о расчёте боя содержатся в документах выше"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rules Version Selection (Priority: P1)

A player starting a new game session wants to choose which rulebook version to use for combat calculations. The game currently supports two rulebook versions: the official "Технолог" version (Bronepekhota_Pravila_05_08_08.pdf) and the fan "Панов" version (rules-originnal.pdf). After selecting a version, all combat calculations (hit, damage, melee) must use the formulas from that rulebook.

**Why this priority**: This is the core feature required for the request. Without it, players cannot choose between rulebook versions, making all other improvements meaningless.

**Independent Test**: Can be fully tested by selecting a rules version from a dropdown in the header, then running combat calculations and verifying the results match the selected rulebook's formulas.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** the player opens the rules version selector, **Then** they see at least two options: "Технолог" and "Панов"
2. **Given** a rules version is selected, **When** the player performs an attack calculation, **Then** the results match the formulas in the selected rulebook
3. **Given** the player switches to a different rules version, **When** they perform the same attack calculation, **Then** the results update according to the newly selected rulebook's formulas
4. **Given** the player has selected a rules version, **When** they refresh the page, **Then** their selection is persisted and restored

---

### User Story 2 - Remove Attack Calculator Tab (Priority: P2)

The application currently has a "Расчёт Атаки" (Attack Calculator) tab that provides a standalone combat calculator. This functionality is no longer needed since combat calculations will now be performed within unit cards using the selected rules version.

**Why this priority**: This is a cleanup task that removes redundant functionality. The core feature (P1) works independently of this removal, but users expect a cleaner interface after the change.

**Independent Test**: Can be verified by checking that the "Атака" button/tab no longer appears in the game session interface, and that all combat calculation functionality is available within individual unit cards.

**Acceptance Scenarios**:

1. **Given** the game session is active, **When** the player views the top control bar, **Then** the "Атака" (Attack) button is no longer visible
2. **Given** the game session is active, **When** the player clicks on a unit card, **Then** they can perform combat calculations directly within the card's modal
3. **Given** a unit card modal is open, **When** the player initiates an attack, **Then** combat calculations use the currently selected rules version

---

### User Story 3 - Extensible Rules Architecture (Priority: P3)

The system must be architected to support adding new rules versions in the future without requiring significant code changes. When a new rulebook PDF becomes available, a developer should be able to add it as a new rules version by implementing calculation functions and registering the version.

**Why this priority**: This is a non-functional requirement that ensures maintainability. The feature works for the two existing versions without this, but extensibility is important for long-term maintenance.

**Independent Test**: Can be verified by examining the code structure to confirm that adding a new rules version requires only implementing calculation functions and registering them, without modifying core game logic.

**Acceptance Scenarios**:

1. **Given** the rules system architecture, **When** a developer adds a new rules version, **Then** they only need to implement calculation functions and register the version (no changes to core game logic)
2. **Given** multiple rules versions exist, **When** the system renders the rules selector, **Then** all registered versions appear in the dropdown

---

### Edge Cases

- What happens when a player switches rules versions mid-game while units have already taken damage/actions?
  - **Resolution**: Combat calculations immediately use the new rules version, but existing unit state (damage, dead soldiers) remains unchanged. This is acceptable since players can switch at any time.
- What happens if a rules version calculation function throws an error?
  - **Resolution**: Show a user-friendly error message in Russian indicating that the calculation failed and suggesting to try a different rules version or contact support.
- What happens if the persisted rules version in localStorage references a version that no longer exists?
  - **Resolution**: Default to "Технолог" (the official version) silently without notification.
- What happens when combat calculations produce different results between rules versions for the same input?
  - **Resolution**: This is expected behavior. The application displays results based on the currently selected version. Players can switch versions to compare.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a rules version selector in the "Штаб" (builder) view header only (not in "В Бой" game view)
- **FR-002**: The system MUST support at least two rules versions: "Технолог" (from Bronepekhota_Pravila_05_08_08.pdf) and "Панов" (from rules-originnal.pdf), with "Технолог" as the default selection for new users
- **FR-003**: The system MUST persist the selected rules version in localStorage so it survives page refreshes
- **FR-004**: When a rules version is selected, the system MUST use that version's formulas for all combat calculations (hit, damage, melee)
- **FR-005**: The system MUST remove the "Атака" (Attack Calculator) tab from the game session interface
- **FR-006**: The system MUST ensure combat calculations are still accessible from within unit cards (not removed, just the standalone tab)
- **FR-007**: The system MUST be architected to allow adding new rules versions by implementing calculation functions and registering them in a TypeScript configuration file (with type safety)
- **FR-008**: Each rules version MUST implement the following calculation functions:
  - `calculateHit(rangeStr: string, distanceSteps: number): HitResult`
  - `calculateDamage(powerStr: string, targetArmor: number): DamageResult`
  - `calculateMelee(attackerMelee: number, defenderMelee: number): MeleeResult`
- **FR-009**: The system MUST display the currently selected rules version name as a compact badge next to the selector dropdown in the builder view header
- **FR-010**: All error messages MUST be in Russian as per project conventions

### Key Entities

- **RulesVersion**: Represents a rulebook variant with unique calculation formulas
  - `id`: Unique identifier for the version (e.g., "tehnolog", "panov")
  - `name`: Display name shown to users (e.g., "Технолог", "Панов")
  - `source`: Reference to the PDF document (e.g., "Bronepekhota_Pravila_05_08_08.pdf")
  - `calculations`: Object containing calculation functions (hit, damage, melee)

- **HitResult**: Result of a hit chance calculation
  - `success`: Whether the attack hit
  - `roll`: The dice roll value(s)
  - `total`: Final modified roll value

- **DamageResult**: Result of a damage calculation
  - `damage`: Number of damage points inflicted
  - `rolls`: Array of individual dice rolls

- **MeleeResult**: Result of a melee combat calculation
  - `attackerRoll`: Attacker's dice roll
  - `attackerTotal`: Attacker's modified total
  - `defenderRoll`: Defender's dice roll
  - `defenderTotal`: Defender's modified total
  - `winner`: "attacker", "defender", or "draw"

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can select a rules version within 5 seconds of opening the application (selector is immediately visible)
- **SC-002**: Combat calculations update within 100ms when switching between rules versions
- **SC-003**: The "Атака" tab is completely removed from the interface with no broken references or console errors
- **SC-004**: Adding a new rules version requires implementing only calculation functions (no changes to core game logic files)
- **SC-005**: 100% of combat calculations produce results matching the selected rulebook's formulas (verified via unit tests)

## Assumptions

1. The two rulebook PDFs contain sufficiently detailed combat calculation formulas to implement distinct versions
2. The formulas between "Технолог" and "Панов" versions differ in at least some aspects (otherwise separate versions would be unnecessary)
3. The current `game-logic.ts` file contains the "Технолог" version formulas (as the default/original implementation)
4. Players may switch between rules versions during gameplay, and this is acceptable behavior
5. Combat calculations within unit cards will continue to use the same dice roll animations and visual feedback as currently implemented
6. The rules version selector should only be visible in the "Штаб" (builder) view, not in the "В Бой" (game) view - this reduces UI clutter during combat and encourages players to select rules before starting battle

## Clarifications

### Session 2025-01-11

- Q: Should the rules selector be visible and changeable during active battle sessions? → A: Selector only in builder view, hidden in game view - reduces UI clutter during combat
- Q: Which rules version should be selected by default for new players or when localStorage is empty? → A: "Технолог" (official version) - default to the publisher's original rules
- Q: Should the system show a notification when falling back to the default rules version after localStorage corruption? → A: Silent recovery - no notification, just use default version
- Q: Where should developers add new rules versions - in code configuration or data files? → A: Code configuration - register in TypeScript file with type safety
- Q: How prominently should the currently selected rules version be displayed in the builder view? → A: Compact badge next to selector - minimal space, clear indication
