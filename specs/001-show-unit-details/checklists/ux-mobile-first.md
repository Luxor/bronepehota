# UX & Mobile-First Requirements Quality Checklist

**Purpose**: Validate UX and mobile requirements quality, consistency, and constitution compliance for the Unit Details Modal feature
**Created**: 2025-01-04
**Feature**: [spec.md](../spec.md) - Show Unit Details in Army Builder
**Scope**: Modal dialog component only (UnitDetailsModal)
**Focus**: Consistency + Constitution mobile compliance (44x44px touch targets, responsive design)

---

## Constitution Compliance (Mobile-First)

- [ ] CHK001 - Are touch targets explicitly specified as minimum 44x44px for all interactive elements in the modal? [Completeness, Constitution §VI]
- [ ] CHK002 - Is the modal layout specified as responsive with defined breakpoints (<768px for mobile)? [Completeness, Constitution §VI]
- [ ] CHK003 - Are hover-only interactions explicitly prohibited for mobile modal interactions? [Consistency, Constitution §VI]
- [ ] CHK004 - Is the viewport meta tag requirement referenced for proper mobile scaling? [Gap, Constitution §VI]
- [ ] CHK005 - Are modal close interactions specified to work without hover (tap/swipe only) on mobile? [Completeness, Constitution §VI]
- [ ] CHK006 - Is text readability specified for mobile (minimum font size, contrast)? [Gap, Constitution §VI]
- [ ] CHK007 - Are modal performance requirements specified for mobile networks (4G/5G)? [Gap, Constitution §VI]
- [ ] CHK008 - Is swipe-to-close gesture specified as an alternative modal close method? [Completeness, Constitution §VI]

## Mobile UX State Requirements

- [ ] CHK009 - Are all modal UI states specified for mobile (open, close, loading, error)? [Completeness, Spec §US-4]
- [ ] CHK010 - Is vertical scroll behavior specified for modal content on mobile? [Completeness, Spec §SC-005]
- [ ] CHK011 - Are touch feedback states specified (active/pressed visual feedback)? [Gap, Mobile UX]
- [ ] CHK012 - Is modal z-index specified to appear above all other mobile UI elements? [Gap, Mobile UX]
- [ ] CHK013 - Are keyboard dismissal requirements specified (tap outside, Escape key on mobile with keyboard)? [Completeness, Spec §FR-008]
- [ ] CHK014 - Is modal backdrop behavior specified on mobile (blur, opacity)? [Gap, Mobile UX]
- [ ] CHK015 - Are modal animation requirements specified for mobile (open/close transitions)? [Gap, Mobile UX]

## Desktop-Mobile Consistency

- [ ] CHK016 - Are modal open interaction triggers consistent between desktop (click/hover) and mobile (tap)? [Consistency, Spec §US-1, §US-2]
- [ ] CHK017 - Is the modal close button placement specified consistently for desktop and mobile? [Consistency, Spec §FR-008]
- [ ] CHK018 - Are modal content layout requirements consistent across desktop and mobile (same information hierarchy)? [Consistency, Spec §FR-006]
- [ ] CHK019 - Is modal sizing specified differently for desktop vs mobile (centered card vs full-screen)? [Completeness, Spec §US-4]
- [ ] CHK020 - Are touch target minimums (44x44px) applied to buttons that may be used on desktop too? [Consistency, Constitution §VI]
- [ ] CHK021 - Is the information display density specified appropriately for each device type? [Gap, Responsive Design]
- [ ] CHK022 - Are modal close methods consistent (click outside on desktop, tap outside on mobile)? [Consistency, Spec §FR-008]

## Visual & Layout Requirements

- [ ] CHK023 - Is the modal header structure specified (title, close button position)? [Completeness, Gap]
- [ ] CHK024 - Are modal content section requirements specified (soldier list, weapon list, speed sectors)? [Completeness, Spec §FR-002, §FR-004]
- [ ] CHK025 - Is modal max-height specified for desktop to prevent overflow? [Gap, Layout]
- [ ] CHK026 - Is modal full-screen requirement specified for mobile explicitly? [Completeness, Spec §US-4]
- [ ] CHK027 - Are modal padding/margins specified for mobile vs desktop? [Gap, Responsive Design]
- [ ] CHK028 - Is modal border radius specified for mobile vs desktop? [Gap, Visual Design]
- [ ] CHK029 - Are modal backdrop blur/opacity requirements specified? [Gap, Visual Design]
- [ ] CHK030 - Is faction color theming specified for modal borders/accent on all devices? [Consistency, Spec §FR-006]

## Content Display Requirements

- [ ] CHK031 - Are soldier stat display requirements specified (grid layout, icon usage)? [Completeness, Spec §FR-002]
- [ ] CHK032 - Is weapon display format specified (name, range, power, special)? [Completeness, Spec §FR-005]
- [ ] CHK033 - Are speed sector display requirements specified (table format, range notation)? [Completeness, Spec §FR-004]
- [ ] CHK034 - Is special property visual highlighting specified ("Г" for grenade)? [Completeness, Spec §FR-012]
- [ ] CHK035 - Are dice notation display requirements specified (monospace font)? [Gap, Content Display]
- [ ] CHK036 - Is soldier image display specified in modal (size, position)? [Completeness, Spec §US-1, §US-2]
- [ ] CHK037 - Is machine image display specified in modal (header placement)? [Completeness, Spec §US-2]
- [ ] CHK038 - Are long text handling requirements specified (weapon names, special rules)? [Gap, Content Display]

## Edge Cases & Error States (Mobile)

- [ ] CHK039 - Are modal empty state requirements specified (no soldiers, no weapons)? [Completeness, Spec §Edge Cases]
- [ ] CHK040 - Is image load failure behavior specified (placeholder, hide, error message)? [Completeness, Spec §FR-009, Edge Cases]
- [ ] CHK041 - Are modal behavior requirements specified for rapid open/close (debounce, animation prevention)? [Completeness, Spec §Edge Cases]
- [ ] CHK042 - Are invalid data display requirements specified (negative stats, empty strings)? [Completeness, Spec §Edge Cases]
- [ ] CHK043 - Is modal behavior specified when network is slow/unavailable on mobile? [Gap, Error State]
- [ ] CHK044 - Are modal timeout requirements specified for long content loading? [Gap, Error State]
- [ ] CHK045 - Is modal error recovery specified (retry, close, show error message)? [Gap, Error State]

## Accessibility Requirements (Mobile + Desktop)

- [ ] CHK046 - Are ARIA attributes specified for modal role and accessibility? [Gap, A11y]
- [ ] CHK047 - Is keyboard navigation specified for modal (Escape to close, Tab trap)? [Completeness, Spec §FR-008]
- [ ] CHK048 - Are screen reader requirements specified for modal content (labels, announcements)? [Gap, A11y]
- [ ] CHK049 - Is focus management specified (where focus goes on open/close)? [Gap, A11y]
- [ ] CHK050 - Are color contrast requirements specified for modal text on mobile? [Gap, A11y]

## Performance Requirements

- [ ] CHK051 - Is modal open timing specified (<300ms per SC-003)? [Measurability, Spec §SC-003]
- [ ] CHK052 - Is modal animation performance specified (60fps, hardware acceleration)? [Gap, Performance]
- [ ] CHK053 - Are modal image lazy loading requirements specified for mobile? [Gap, Performance, Constitution §VI]
- [ ] CHK054 - Is modal content rendering optimization specified (virtual scrolling for long lists)? [Gap, Performance]

## Russian Language Requirements

- [ ] CHK055 - Are all modal UI text elements specified in Russian? [Completeness, Constitution §I]
- [ ] CHK056 - Are modal error messages specified in Russian? [Completeness, Constitution §I]
- [ ] CHK057 - Are modal tooltip/hint text specified in Russian? [Completeness, Constitution §I]
- [ ] CHK058 - Are modal button labels specified in Russian (close, scroll indicators)? [Gap, Constitution §I]

## Success Criteria Measurability

- [ ] CHK059 - Can "2 клика/тапа" be objectively measured (SC-001, SC-002)? [Measurability, Spec §SC-001, §SC-002]
- [ ] CHK060 - Can "300мс" modal open time be objectively verified (SC-003)? [Measurability, Spec §SC-003]
- [ ] CHK061 - Can "100% пользователей находят характеристики с первой попытки" be measured (SC-004)? [Measurability, Spec §SC-004]
- [ ] CHK062 - Can "без горизонтальной прокрутки" be objectively verified (SC-005)? [Measurability, Spec §SC-005]
- [ ] CHK063 - Can "1 клик/тап" close requirement be measured (SC-006)? [Measurability, Spec §SC-006]

## State Management Requirements

- [ ] CHK064 - Are modal state persistence requirements specified (filters, search preserved)? [Completeness, Spec §FR-011]
- [ ] CHK065 - Is modal state restoration specified after close (return to previous UI state)? [Completeness, Spec §US-3]
- [ ] CHK066 - Are modal state requirements specified for rapid unit switching (update content vs reopen)? [Gap, State Management]
- [ ] CHK067 - Is modal state cleanup specified (memory, event listeners)? [Gap, State Management]

---

## Summary

**Total Items**: 67
**Focus Areas**: Modal dialog UX, Mobile-first constitution compliance, Consistency validation
**Coverage**:
- Constitution mobile requirements (44x44px, responsive, no hover-only)
- Modal state requirements (open, close, loading, error)
- Desktop-mobile consistency (interactions, layout, behavior)
- Visual and layout requirements (header, content, sizing)
- Content display (soldier stats, weapons, speed sectors)
- Edge cases and error states
- Accessibility (ARIA, keyboard, screen readers)
- Performance (timing, animations, loading)
- Russian language compliance
- Success criteria measurability
- State management

**Quality Dimensions Tested**:
- [x] Completeness - Are all mobile UX requirements specified?
- [x] Consistency - Are modal patterns consistent across devices?
- [x] Measurability - Can success criteria be objectively verified?
- [x] Constitution Compliance - Do requirements align with Principle VI (Mobile-First)?

**Constitution References**:
- Principle I: Russian Language UI (CHK055-CHK058)
- Principle VI: Mobile-First Experience (CHK001-CHK008)

**Next Steps**:
- Address items marked `[Gap]` by adding missing requirements to spec.md
- Verify all `[Consistency]` items align with existing modal patterns
- Confirm `[Measurability]` items can be objectively tested
- Ensure all constitution compliance items are reflected in plan.md and tasks.md
