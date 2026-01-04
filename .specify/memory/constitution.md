<!--
Sync Impact Report:
Version change: 1.2.0 → 2.0.0
Modified principles: None
Added sections:
  - Core Principle VI: Mobile-First Experience (new principle)
  - Quality Gates: Mobile testing requirements added
  - Code Review Checklist: Mobile usability checks added
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md - Constitution Check updated with mobile principle
  ✅ spec-template.md - No changes needed
  ✅ tasks-template.md - No changes needed
  ✅ All command templates verified
Follow-up TODOs: None
-->

# Бронепехота (Bronepehota) Constitution

## Core Principles

### I. Russian Language UI

All user-facing text MUST be in Russian. This includes all UI elements, error messages, tooltips, and API responses that reach the client.

**Rationale**: The application serves Russian-speaking users for a tabletop wargame. Consistent Russian localization ensures accessibility and user experience.

**Implementation**:
- UI component text: Russian
- API error messages: Russian (e.g., `Ошибка чтения данных`, `Фракция не найдена`)
- Code identifiers: English (variable names, function names, types)
- Comments and documentation: English

### II. File-Based Data Storage

Game data (factions, squads, machines) MUST be stored as JSON files in `src/data/`. API routes MUST use synchronous file operations (`readFileSync`, `writeFileSync`).

**Rationale**: Simple, version-controllable data storage without external database dependencies. Synchronous operations are acceptable for the expected scale and simplify error handling.

**Constraints**:
- All API routes under `src/app/api/armlists/` operate on JSON files
- POST handlers handle both create (new ID generation) and update (existing ID)
- Image uploads save to `public/images/` with timestamp + random suffix for uniqueness

### III. Client-Side Army State

Army state MUST be persisted to `localStorage` using key `bronepehota_army`. State MUST be managed through React useState in the main page component and passed down to children.

**Rationale**: Enables offline gameplay, simplifies state management, provides instant persistence without server calls. Distinguishes template data (immutable definitions) from runtime data (mutable game state).

**Data Separation**:
- Template data: `Squad`, `Machine` from JSON (read-only, cached)
- Runtime data: `ArmyUnit` with current state (durability, ammo, deadSoldiers, actionsUsed)

### IV. Type Safety

All TypeScript types MUST be defined in `src/lib/types.ts`. Adding new game entities (e.g., new faction) requires updating both the type definition and the corresponding JSON data file.

**Rationale**: Central type definitions ensure consistency across the application, enable compile-time error checking, and serve as single source of truth for data structures.

**Requirements**:
- `FactionID` type MUST list all valid faction identifiers
- Type changes MUST include corresponding JSON updates
- No `any` types without explicit justification

### V. Test Game Logic

Game mechanics in `src/lib/game-logic.ts` MUST have corresponding Jest tests in `src/__tests__/`. Focus areas: dice notation parsing, hit calculation, damage calculation, melee combat.

**Rationale**: Game logic correctness is critical for fair gameplay. Automated tests prevent regressions when mechanics change and document expected behavior.

**Test Requirements**:
- Dice notation: `parseRoll`, `executeRoll` with formats like "D6", "D12+2", "2D12", "ББ"
- Combat calculations: `calculateHit`, `calculateDamage`, `calculateMelee`
- Edge cases: boundary values, special inputs ("ББ" for melee)
- Test files use `.test.ts` suffix in `src/__tests__/`

### VI. Mobile-First Experience

The application MUST provide excellent usability on both desktop browsers and mobile devices. Army management features MUST be optimized for mobile interaction patterns.

**Rationale**: Players use the application during tabletop game sessions where mobile devices are the primary interface. Poor mobile usability directly impacts the game experience. Soldiers must be easily identifiable by their images during gameplay.

**Requirements**:
- Touch-friendly controls: minimum 44x44px tap targets, no hover-only interactions
- Responsive layout: mobile-first design using Tailwind breakpoints
- Army management core flows (build, edit, game session) MUST work seamlessly on mobile
- Viewport meta tag configured for mobile (no zoom, proper scaling)
- Text input optimized for mobile keyboards
- Critical actions (add unit, modify state, combat) accessible within 1-2 taps
- Performance: fast load times on mobile networks (4G/5G)
- **Soldier images**: MUST be clearly visible and identifiable on mobile for unit recognition during gameplay

**Implementation**:
- Use Tailwind responsive utilities: `hidden md:inline` for conditional display
- Test all user flows on actual mobile devices or mobile emulation
- Prefer bottom navigation/sheet modals over dropdowns on mobile
- Swipe gestures where appropriate (e.g., delete, dismiss)
- Collapse complex UI into expandable sections on small screens
- Soldier/unit images MUST render at sufficient size and quality on mobile screens
- Image loading MUST be optimized for mobile (lazy load, appropriate sizing)

## Development Standards

### Reference Documentation

Fan game rules and army list calculators are located in `doc/panov/`.

Soldier army lists (арм листы для солдат) are available in the VK community album:
https://vk.com/album-233498256_310668795

**Rationale**: These resources contain the authoritative source of truth for game mechanics, unit statistics, and faction rules. All game logic implementation MUST align with these reference materials.

**Usage**:
- When implementing new game mechanics, reference `doc/panov/` for correct formulas and rules
- When adding new squads or soldiers, verify data against VK community album army lists
- When adding new units or factions, verify data against fan army list calculators
- Discrepancies between implementation and reference docs MUST be documented and resolved

### Dice Notation

Game mechanics use specific dice notation formats:
- Range: "D6", "D12", "D20" (single die)
- Power: "1D6", "2D12" (multi-die with optional bonus)
- Melee: "ББ" (special case, no roll)
- Bonus modifier: "+N" suffix (e.g., "D12+2")

### Faction System

Three factions are defined:
- `polaris` - Red color (#ef4444)
- `protectorate` - Blue color (#3b82f6)
- `mercenaries` - Yellow color (#eab308)

Adding a new faction requires:
1. Update `FactionID` type in `src/lib/types.ts`
2. Add faction entry to `src/data/factions.json`
3. Define faction-specific styling color

### Component Architecture

- Main page (`src/app/page.tsx`) manages `Army` state
- View toggle between ArmyBuilder (construction) and GameSession (gameplay)
- Nested editor pattern: `ArmlistEditor` → `SquadEditor`/`MachineEditor` → soldier/weapon sub-editors
- Image upload supports: file picker, drag-drop, clipboard paste (Ctrl+V)

### Styling Conventions

- **Tailwind CSS** with dark theme (slate-900 base)
- Mobile-first responsive design
- Hide labels on mobile using `hidden md:inline`
- Path alias `@/*` maps to `src/*`

## Quality Gates

### Before Commit

- `npm run lint` MUST pass without errors
- `npm run test` MUST pass all tests
- TypeScript compilation MUST succeed
- New game logic features MUST include tests

### Before Release

- All user flows tested manually
- Error messages verified to be in Russian
- Image upload functionality validated (all three methods)
- Faction colors consistent across UI
- Game mechanics verified against `doc/panov/` reference docs and VK album
- **Mobile testing**: All core flows tested on mobile device or emulation
- **Touch targets**: Minimum 44x44px for all interactive elements verified
- **Soldier images**: Visible and identifiable on mobile for unit selection

### Code Review Checklist

- [ ] Russian language for all user-facing text
- [ ] Type definitions updated for new entities
- [ ] Tests added/updated for game logic changes
- [ ] No `any` types without justification
- [ ] localStorage key remains `bronepehota_army`
- [ ] File operations use synchronous APIs
- [ ] Game mechanics aligned with `doc/panov/` and VK album reference materials
- [ ] Mobile layout tested (responsive design, touch targets)
- [ ] No hover-only interactions that break mobile usability
- [ ] Soldier/unit images clearly visible on mobile for gameplay identification

## Governance

### Amendment Process

1. Principle changes require updating this document and incrementing version
2. Version follows semantic versioning (MAJOR.MINOR.PATCH):
   - MAJOR: Backward-incompatible changes (e.g., removing data storage principle)
   - MINOR: New principle or section added
   - PATCH: Clarifications, wording improvements
3. Updates MUST propagate to dependent templates (plan, spec, tasks)
4. Date stamp MUST be updated for any change

### Compliance

- All features and code changes MUST align with these principles
- Constitution Check in plan template MUST verify compliance before implementation
- Violations require explicit justification in Complexity Tracking table
- Runtime development guidance in `CLAUDE.md` complements this constitution

### Authority

This constitution supersedes all other practices. In case of conflict between this document and general coding practices, these principles take precedence for the Бронепехота project.

**Version**: 2.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04
