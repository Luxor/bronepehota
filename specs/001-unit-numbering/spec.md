# Feature Specification: Unit Numbering and Count Display

**Feature Branch**: `001-unit-numbering`
**Created**: 2025-01-11
**Status**: Draft
**Input**: User description: "При выбое подразделения во время набора фракции, необходимо показывать (возможно в кнопке добавить) сколько юнитов такого типа куплено. У каждого юнита оинаковорг типа должен быть номер чтобы отличать их друг от друга. Это касается и фазы боя"

## Clarifications

### Session 2025-01-11

- Q: What visual format should be used for unit numbers? → A: Hash symbol with space (e.g., "#1", "#2", "#3")
- Q: How should the unit count be displayed visually? → A: Badge/counter on "Add" button corner
- Q: What is the maximum number of units of the same type that can be added? → A: 99 units maximum per type
- Q: How should unit numbers be displayed on unit cards in the army list? → A: Show only the number with hash (e.g., "#1", "#2")
- Q: When should the count display update after adding/removing a unit? → A: Immediately (instant update)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Unit Count During Selection (Priority: P1)

When building an army, the player needs to see at a glance how many units of each type they have already added to their army. This count should be visible when browsing available units to add.

**Why this priority**: This is the foundation for all other features. Without visibility into current army composition, players cannot make informed decisions about what to add. This directly addresses the user's requirement to "show how many units of this type are purchased."

**Independent Test**: Can be fully tested by selecting a faction, browsing units, and verifying that each unit card displays the correct count of already-purchased units. Delivers immediate value by helping players understand their current army composition.

**Acceptance Scenarios**:

1. **Given** the player is on the army building screen with a selected faction, **When** viewing the list of available units, **Then** each unit card displays a count showing "0" if no units of this type are in the army
2. **Given** the player has added 2 units of type "Light Assault Clone" to their army, **When** viewing the unit list, **Then** the "Light Assault Clone" card displays a count of "2"
3. **Given** the player removes a unit from their army, **When** the unit is removed, **Then** the displayed count for that unit type decreases by 1
4. **Given** the player adds a unit to their army, **When** the unit is added, **Then** the displayed count for that unit type increases by 1

---

### User Story 2 - Unique Unit Number Assignment (Priority: P2)

Each unit added to the army must receive a unique number that distinguishes it from other units of the same type. This number is assigned when the unit is added and persists throughout the session.

**Why this priority**: This is essential for the core requirement that "each unit of the same type must have a number to distinguish them from each other." Without unique numbering, multiple identical units cannot be individually identified.

**Independent Test**: Can be fully tested by adding multiple units of the same type and verifying that each receives a sequential, unique number. Delivers value by enabling players to track and reference specific units.

**Acceptance Scenarios**:

1. **Given** the player adds the first "Light Assault Clone" unit to their army, **When** the unit is added, **Then** it is assigned number "1"
2. **Given** the player has 2 "Light Assault Clone" units (numbered 1 and 2), **When** a third "Light Assault Clone" is added, **Then** it is assigned number "3"
3. **Given** the player has 3 units of type A (numbered 1, 2, 3) and 2 units of type B, **When** another unit of type A is added, **Then** it is assigned number "4" (not "3")
4. **Given** the player removes unit #2 of a type, **When** later adding another unit of the same type, **Then** the new unit receives the next sequential number (not reusing the deleted number)

---

### User Story 3 - Unit Numbers in Combat Phase (Priority: P3)

During the combat phase, each unit's unique number must be visible so players can identify and interact with specific units of the same type.

**Why this priority**: This extends the numbering system to the combat phase as explicitly requested by the user ("this also applies to the combat phase"). It enables players to distinguish between identical units during gameplay.

**Independent Test**: Can be fully tested by entering combat mode with an army containing multiple units of the same type, and verifying that each unit displays its unique identifier. Delivers value by preventing confusion during combat actions.

**Acceptance Scenarios**:

1. **Given** the player enters combat mode with 3 "Light Assault Clone" units (numbered 1, 2, 3), **When** viewing the units tab, **Then** each unit card displays its unique number using hash format (e.g., "Light Assault Clone #1", "Light Assault Clone #2", "Light Assault Clone #3")
2. **Given** the player performs an action on a specific unit, **When** selecting a unit, **Then** the unit's number is clearly visible in the selection UI
3. **Given** a unit takes damage or dies during combat, **When** viewing unit status, **Then** the unit can be uniquely identified by its number
4. **Given** the player exports their army and imports it later, **When** viewing the imported army, **Then** all unit numbers are preserved

---

### Edge Cases

- What happens when the player has 10 or more units of the same type? (Display should handle multi-digit numbers without layout issues)
- What happens when a unit is removed from the army - are numbers reassigned or gaps left? (Gaps should be left; new units get next sequential number)
- What happens when switching between different factions? (Each faction maintains its own unit count and numbering)
- What happens when importing an army that has units with custom numbers? (Preserve existing numbers from import)
- What happens when the player attempts to add a unit when 99 units of that type already exist? (Prevent adding the 100th unit and show feedback)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a count of how many units of each type are currently in the player's army when browsing available units
- **FR-002**: System MUST update the unit count display immediately (instantly) when a unit is added or removed from the army
- **FR-003**: System MUST assign a unique sequential number to each unit when it is added to the army
- **FR-004**: System MUST number units independently by type using hash symbol format (e.g., "Light Assault Clone #1" and "Heavy Mech #1" can coexist)
- **FR-005**: System MUST display each unit's unique number in the army list view showing only the number with hash (e.g., "#1", "#2")
- **FR-006**: System MUST display each unit's unique number during the combat phase
- **FR-007**: System MUST preserve unit numbers when saving and loading army data
- **FR-008**: System MUST not reuse deleted unit numbers (numbers always increment)
- **FR-009**: System MUST display the count indicator as a badge/counter on the "Add" button corner for each unit type
- **FR-010**: System MUST handle unit numbers up to 99 (2 digits) without display issues
- **FR-011**: System MUST prevent adding more than 99 units of the same type and display appropriate feedback

### Key Entities

- **ArmyUnit**: Represents a single unit instance in the player's army, contains reference to its template (Squad or Machine), unique instance number, and current game state (durability, ammo, actions used)
- **UnitType**: Represents a template for a unit type (Squad or Machine definition), shared across all instances of that type
- **ArmyComposition**: Represents the collection of all units in the player's army, tracks counts by unit type for display purposes

## Assumptions

- The count display will be shown as a badge/counter on the "Add" button corner during army building
- Unit numbers use hash symbol format (e.g., "#1", "#2", "#3") and start at 1 for each unit type, incrementing sequentially
- Unit numbers are assigned at creation time and persist for the lifetime of that unit instance
- The numbering is per-session (not globally persistent across different army builds)
- Players may have up to 99 units of the same type
- The current JSON-based storage and localStorage mechanisms are sufficient for storing unit numbers

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can see how many units of each type they have added without opening a separate view or panel
- **SC-002**: Players can uniquely identify any specific unit when multiple units of the same type exist in their army
- **SC-003**: Unit count updates are visible within 1 second of adding or removing a unit
- **SC-004**: 100% of units of the same type in an army have unique, non-conflicting numbers
- **SC-005**: Unit numbers remain consistent and correct throughout a full session (army building through combat)
- **SC-006**: Players can distinguish between at least 10 units of the same type without confusion
- **SC-007**: Exported/imported armies maintain all unit numbers with 100% accuracy
