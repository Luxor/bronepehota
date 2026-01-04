# Research: Army Building Flow

**Feature**: 001-army-building-flow
**Date**: 2026-01-04
**Status**: Complete

## Overview

This document captures research findings and technical decisions for the Army Building Flow feature. All technical context items from the implementation plan were resolved using existing codebase patterns and established best practices.

## Decision Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| State Management | Extend existing Army state pattern | Already proven, uses localStorage (FR-017) |
| Point Budget Tracking | Client-side calculation | No server-side persistence needed, fast feedback |
| Faction Data | Use existing factions.json | All required fields present, no migration needed |
| Unit Filtering | Client-side filter by factionId | Simple, fast, no API changes required |
| Battle Phase Lockout | Add `isInBattle` flag to Army state | Minimal change, leverages existing localStorage pattern |
| Mobile UX | Extend Tailwind patterns | Consistent with existing mobile-first approach |
| Input Validation | React form validation | Standard pattern, no external dependencies needed |

## Detailed Findings

### 1. State Management Architecture

**Decision**: Extend existing `Army` state in `src/app/page.tsx`

**Research**: Reviewed existing state management in the main page component.

**Findings**:
- Current `Army` type already includes `faction`, `units`, and `totalCost`
- State is persisted to `localStorage` with key `bronepehota_army`
- Pattern: `const [army, setArmy] = useState<Army>(initialArmy)`
- Hydration on mount: `useEffect` loads from localStorage

**Extension Needed**:
- Add `pointBudget?: number` to `Army` type for budget tracking
- Add `isInBattle?: boolean` for battle phase lockout
- Add `currentStep?: 'faction-select' | 'unit-select' | 'battle'` for flow tracking

### 2. Point Budget System

**Decision**: Client-side budget enforcement with custom + preset options

**Research**: Analyzed existing `cost` field in `Squad` type.

**Findings**:
- `Squad.cost` field already exists in `src/lib/types.ts`
- `Army.totalCost` is already calculated
- No server-side budget validation currently exists

**Implementation Approach**:
- Preset buttons: 250, 350, 500, 1000 (common wargame values)
- Custom input: Number input with validation (1-10000 range per assumption)
- Real-time budget check: `remainingPoints = pointBudget - totalCost`
- Visual feedback: Color-code remaining points (green → yellow → red)

### 3. Faction Selection UI

**Decision**: Card-based faction selector with expandable details

**Research**: Reviewed existing faction data structure.

**Findings**:
- `Faction` type includes all required fields: `id`, `name`, `description`, `motto`, `homeWorld`, `color`
- Three factions exist: `polaris`, `protectorate`, `mercenaries`
- Faction colors map to Tailwind: `#ef4444` (red), `#3b82f6` (blue), `#eab308` (yellow)

**UI Pattern**:
- Horizontal scrollable cards on mobile, grid on desktop
- Tap to expand: shows description, motto, homeworld
- Selected state: faction color border + checkmark
- Touch targets: minimum 44x44px per constitution

### 4. Unit Selection with Budget

**Decision**: Filtered unit list with budget-aware add/remove

**Research**: Examined existing `ArmyBuilder` component and unit display.

**Findings**:
- Existing `UnitCard` component shows unit with image and stats
- Units already loaded from `squads.json` via API routes
- Filter pattern exists: can filter by faction ID

**New Components Needed**:
- `UnitSelector.tsx`: Main unit selection interface
- Budget display: Shows "Осталось очков: X / Y" (Remaining points)
- Add button: Disabled if `unit.cost > remainingPoints`
- Warning toast: "Недостаточно очков" (Not enough points) when attempting over-budget add

### 5. Battle Phase Lockout

**Decision**: Boolean flag in Army state with UI visibility toggle

**Research**: Reviewed existing `GameSession` component.

**Findings**:
- Existing view toggle: `ArmyBuilder` ↔ `GameSession`
- Current implementation allows free switching between views

**Implementation**:
- Add `army.isInBattle` flag when entering battle phase
- Hide/disable "Штаб" (Army Builder) button when `isInBattle === true`
- Add "Завершить бой" (End battle) button to exit battle phase
- On battle end: clear army units, reset to faction selection (per "donabór армии нельзя")

### 6. Mobile-First UX Patterns

**Decision**: Extend existing Tailwind responsive patterns

**Research**: Reviewed existing mobile implementation.

**Findings**:
- Existing pattern: `hidden md:inline` for conditional display
- Dark theme: `slate-900` base
- Touch targets already partially implemented

**Enhancements Needed**:
- Faction cards: full-width on mobile, minimum 80px height
- Unit images: minimum 120px width on mobile for identification
- Preset buttons: large touch targets (48px height)
- Bottom sheet for unit details on mobile (vs modal on desktop)
- Swipe-to-dismiss for toasts/notifications

### 7. Data Validation

**Decision**: Client-side validation with Russian error messages

**Research**: Reviewed constitution requirements.

**Findings**:
- Constitution requires Russian UI text (Principle I)
- Existing validation: undefined in current codebase

**Validation Rules**:
- Point budget: Must be positive integer, 1-10000 range
- Faction selection: Required before proceeding
- Empty army: Warning before entering battle phase (optional, good UX)

**Error Messages** (Russian):
- "Введите положительное число" (Enter a positive number)
- "Выберите фракцию" (Select a faction)
- "Недостаточно очков" (Not enough points)
- "Армия пуста" (Army is empty)

### 8. Edge Case Handling

**Decision**: Graceful degradation with user-friendly feedback

**Edge Cases from Spec**:

| Edge Case | Resolution |
|-----------|------------|
| Invalid point values (negative, zero) | Input validation, error message |
| No faction selected | Disable "Далее" (Next) button |
| Point budget equals unit cost (boundary) | Allow addition (inclusive boundary) |
| All units exceed budget | Show empty state: "Нет доступных юнитов" (No available units) |
| Session interruption (refresh) | localStorage restores state (existing pattern) |
| Faction data missing | Graceful error: "Ошибка загрузки данных" (Data load error) |
| Custom equals preset value | Treat as custom (no special handling needed) |
| Switch factions after unit selection | Clear selected units, show confirmation: "Сменить фракцию? Выбранные юниты будут очищены" (Change faction? Selected units will be cleared) |

### 9. Performance Considerations

**Decision**: Leverage existing optimization patterns

**Findings**:
- Next.js 14: App Router with Server Components where applicable
- Image optimization: `next/image` for lazy loading
- localStorage: Synchronous, but acceptable for single-user session

**Performance Targets** (from spec SC-001, SC-002):
- Faction selection: <30 seconds
- Army building: <5 minutes
- Both targets easily achievable with client-side operations

### 10. Testing Strategy

**Decision**: Jest + React Testing Library for component testing

**Research**: Reviewed existing test setup.

**Findings**:
- Jest configured with jsdom environment
- Existing `game-logic.test.ts` provides pattern reference
- Test files in `src/__tests__/`

**Test Coverage Needed**:
- Faction selection: Render, select faction, persist state
- Point budget: Preset selection, custom input validation
- Unit selection: Add unit, remove unit, budget enforcement
- Battle lockout: Enter battle, disabled return, exit battle
- Mobile: Touch targets, responsive layout
- Edge cases: All 8 cases from spec

## Alternatives Considered

### State Management: Redux vs useState

**Considered**: Redux Toolkit for centralized state

**Rejected Because**:
- Existing codebase uses useState pattern successfully
- Feature scope doesn't require complex state orchestration
- Adds dependency overhead for minimal benefit
- localStorage integration simpler with useState

### Budget Validation: Server-side API

**Considered**: Add budget validation to API routes

**Rejected Because**:
- Budget is session-scoped, not persisted
- Client-side validation is instant (better UX)
- No security risk (player can only "cheat" themselves)
- Simpler implementation, aligns with offline-first architecture

### Battle Lockout: Route Protection

**Considered**: Use Next.js middleware for route protection

**Rejected Because**:
- Single-page application, not multi-route
- Client-side flag sufficient for game integrity
- Route protection would require routing architecture changes
- Overkill for this use case

## Open Questions (None)

All technical context items resolved. No open questions blocking implementation.

## References

- Constitution: `.specify/memory/constitution.md`
- Existing types: `src/lib/types.ts`
- Existing components: `src/components/ArmyBuilder.tsx`, `src/components/GameSession.tsx`
- Data layer: `src/data/factions.json`, `src/data/squads.json`
