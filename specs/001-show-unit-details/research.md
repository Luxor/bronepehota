# Research: Show Unit Details in Army Builder

**Feature**: 001-show-unit-details
**Date**: 2025-01-04
**Status**: Complete

## Overview

This research phase investigated the best practices for implementing modal dialogs in React/Next.js with mobile-first responsive design, since the feature is purely UI-focused with no new technologies or backend changes.

## Research Questions

### RQ-1: Modal Dialog Implementation in React/Next.js

**Question**: What is the best practice for implementing accessible modal dialogs in React/Next.js that work well on mobile?

**Decision**: Use a controlled React component with fixed overlay positioning, backdrop blur, and CSS transitions for smooth animations.

**Rationale**:
- React state management provides clean control over modal open/close
- Fixed positioning with z-index ensures modal appears above all content
- Backdrop blur provides visual focus on the modal content
- CSS transitions are hardware-accelerated and performant
- No external library needed - keeps bundle size small

**Alternatives Considered**:
- **React-Bootstrap/React-Bootstrap Modal**: Rejected because adds unnecessary dependency for simple use case
- **Headless UI Dialog**: Rejected because overkill for this simple feature, adds bundle size
- **Radix UI Dialog**: Rejected because similar to Headless UI, more complexity than needed

**Implementation Notes**:
- Use `useState` for open/close state
- Use `useEffect` to add/remove `overflow: hidden` from body when modal opens
- Support click-outside to close (desktop) and backdrop press (mobile)
- Support Escape key to close
- Add ARIA attributes for accessibility: `role="dialog"`, `aria-modal="true"`
- Focus trap not strictly necessary for simple view-only modal but good for accessibility

### RQ-2: Mobile-First Responsive Design for Modals

**Question**: How should the modal layout adapt for mobile vs desktop?

**Decision**: Full-screen with close button on mobile, centered card with max-width on desktop.

**Rationale**:
- Mobile: Full-screen maximizes space for content, easier to scroll
- Desktop: Centered card with max-width (e.g., 600px) maintains readability
- Touch targets minimum 44x44px per constitution requirement
- Vertical scroll for long content (6 soldiers with full stats)

**Alternatives Considered**:
- **Bottom sheet on mobile**: Rejected because more complex to implement, full-screen is sufficient
- **Same size on all devices**: Rejected because poor UX on small screens

**Implementation Notes**:
- Use Tailwind responsive classes: `w-full h-full md:max-w-2xl md:max-h-[90vh]`
- Close button in top-right corner, minimum 44x44px
- Content area with `overflow-y-auto` for scrollable content
- Padding should be responsive: `p-4 md:p-6`

### RQ-3: Displaying Dice Notation and Game Stats

**Question**: How should dice notation (D6, D12+2, etc.) and game statistics be displayed for readability?

**Decision**: Use monospace font for dice notation, grid layout for stats, visual separators for sections.

**Rationale**:
- Monospace font (`font-mono`) makes dice notation easier to read
- Grid layout organizes stats logically (name, value pairs)
- Visual separators (borders, background colors) help group related information
- Icons from Lucide React provide visual cues for stat types

**Alternatives Considered**:
- **Plain text**: Rejected because harder to scan
- **Table**: Rejected because less flexible for responsive design

**Implementation Notes**:
- Use `font-mono` class for dice notation values
- Use CSS Grid: `grid-cols-2 md:grid-cols-3` for stat display
- Use icon + label + value pattern for each stat
- Background color variations for visual hierarchy

## Decisions Summary

| Question | Decision | Key Consideration |
|----------|----------|-------------------|
| Modal implementation | Controlled React component | No external dependencies, clean state management |
| Mobile layout | Full-screen modal | Maximizes space on small screens |
| Desktop layout | Centered card with max-width | Maintains readability |
| Stat display | Grid with icons | Scannable, responsive |
| Touch targets | Minimum 44x44px | Constitution requirement |

## Open Questions

None. All technical decisions resolved.

## Next Steps

Proceed to **Phase 1: Design & Contracts** to create:
- `data-model.md` - Entity definitions from spec
- `quickstart.md` - Implementation guide
- Component structure for `UnitDetailsModal.tsx`
