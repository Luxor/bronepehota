# Quickstart: Show Unit Details in Army Builder

**Feature**: 001-show-unit-details
**Branch**: `001-show-unit-details`
**Date**: 2025-01-04

## Overview

This guide helps you implement the unit details modal feature. The feature adds a modal dialog that displays detailed unit characteristics when users click on unit cards in the army builder.

## Prerequisites

- Read the [specification](spec.md) for requirements
- Read the [research document](research.md) for technical decisions
- Read the [data model](data-model.md) for entity definitions
- Familiarity with React, TypeScript, Next.js, Tailwind CSS

## Implementation Steps

### Step 1: Create UnitDetailsModal Component

**File**: `src/components/UnitDetailsModal.tsx`

**Purpose**: Reusable modal component for displaying squad or machine details

**Key Features**:
- Responsive: full-screen on mobile, centered card on desktop
- Accessible: ARIA attributes, keyboard navigation (Escape to close)
- Touch-friendly: 44x44px minimum tap targets
- Animated: smooth fade-in/scale-in transitions

**Skeleton**:

```tsx
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Squad, Machine, Faction } from '@/lib/types';

interface UnitDetailsModalProps {
  unit: Squad | Machine;
  unitType: 'squad' | 'machine';
  faction: Faction;
  isOpen: boolean;
  onClose: () => void;
}

export function UnitDetailsModal({
  unit,
  unitType,
  faction,
  isOpen,
  onClose,
}: UnitDetailsModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal content */}
      <div className="w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] bg-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header with close button */}
        {/* Content area with scroll */}
      </div>
    </div>
  );
}
```

### Step 2: Add Modal State to ArmyBuilder

**File**: `src/components/ArmyBuilder.tsx`

**Changes**:
1. Import the new modal component
2. Add state for selected unit and modal visibility
3. Add click handler to unit cards (in the legacy view section)
4. Render the modal

```tsx
// Add imports
import { UnitDetailsModal } from './UnitDetailsModal';
import type { Squad, Machine } from '@/lib/types';

// Add state inside component
const [selectedUnit, setSelectedUnit] = useState<Squad | Machine | null>(null);
const [selectedUnitType, setSelectedUnitType] = useState<'squad' | 'machine'>('squad');
const [isModalOpen, setIsModalOpen] = useState(false);

// Add click handler
const handleUnitClick = (unit: Squad | Machine, type: 'squad' | 'machine') => {
  setSelectedUnit(unit);
  setSelectedUnitType(type);
  setIsModalOpen(true);
};

// Add click handler to squad cards (around line 248)
onClick={() => handleUnitClick(s, 'squad')}

// Add click handler to machine cards (around line 285)
onClick={() => addUnit(m, 'machine')}  // Change to handleUnitClick(m, 'machine')

// Add modal at the end of component return
<UnitDetailsModal
  unit={selectedUnit!}
  unitType={selectedUnitType}
  faction={selectedFactionData!}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>
```

**Note**: For machine cards, you may want to keep both the add button and make the card clickable for details. Consider adding a separate "Details" button or making the card body clickable while keeping the add button separate.

### Step 3: Add Modal State to UnitSelector

**File**: `src/components/UnitSelector.tsx`

**Changes**: Similar to ArmyBuilder
1. Import and use UnitDetailsModal
2. Add state for modal
3. Add click handler to squad cards in the grid (around line 142)

```tsx
// Make squad cards clickable
<div
  key={squad.id}
  onClick={() => onAddUnit(squad)}  // Keep this
  // Add additional click handler or make card clickable for details
>
```

**Recommendation**: Add a separate "Info" or "Details" icon button next to the "Add" button, or make clicking the card body (outside the add button) open the details modal.

### Step 4: Implement Squad Details Content

**In UnitDetailsModal.tsx**

Add content rendering for squads. Display each soldier with their stats:

```tsx
{unitType === 'squad' && (
  <div className="p-4 md:p-6 overflow-y-auto flex-1">
    <h3 className="text-xl font-bold mb-4">Состав отряда</h3>
    {(unit as Squad).soldiers.map((soldier, index) => (
      <div key={index} className="bg-slate-700/50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-2">Боец #{index + 1}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Render each stat with icon */}
        </div>
      </div>
    ))}
  </div>
)}
```

### Step 5: Implement Machine Details Content

**In UnitDetailsModal.tsx**

Add content rendering for machines. Display stats, speed sectors, and weapons:

```tsx
{unitType === 'machine' && (
  <div className="p-4 md:p-6 overflow-y-auto flex-1">
    {/* Basic stats */}
    {/* Speed sectors table */}
    {/* Weapons list */}
  </div>
)}
```

### Step 6: Styling and Responsive Design

**Key Tailwind Classes**:
- Modal container: `fixed inset-0 z-50`
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Modal content: `w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh]`
- Touch targets: `min-h-[44px] min-w-[44px]`
- Scrollable content: `overflow-y-auto flex-1`
- Close button: `absolute top-4 right-4 p-2 rounded-lg bg-slate-700 hover:bg-slate-600`

**Mobile Considerations**:
- Full-screen modal on mobile (`w-full h-full`)
- Close button in top-right, minimum 44x44px
- Vertical scroll for content
- Larger text for readability (14px minimum)

## Testing Checklist

### Desktop
- [ ] Modal opens when clicking unit card
- [ ] Modal closes when clicking close button
- [ ] Modal closes when clicking backdrop
- [ ] Modal closes when pressing Escape
- [ ] Body scroll is prevented when modal is open
- [ ] All stats display correctly for squads
- [ ] All stats display correctly for machines
- [ ] Faction colors apply correctly
- [ ] Images load and display (if present)

### Mobile
- [ ] Modal is full-screen on mobile
- [ ] Close button is tappable (44x44px minimum)
- [ ] Content scrolls vertically only
- [ ] No horizontal scroll
- [ ] Text is readable (14px minimum)
- [ ] Touch targets are large enough
- [ ] Backdrop tap closes modal

### Edge Cases
- [ ] Empty soldiers array shows message
- [ ] Empty weapons array shows message
- [ ] Missing image doesn't break layout
- [ ] Long weapon names are handled
- [ ] All 6 soldiers display in scrollable list

## Constitution Compliance

- [x] **Russian UI**: All text in Russian
- [x] **Mobile-First**: Touch-friendly, responsive, 44x44px targets
- [x] **Type Safety**: Uses existing types from `src/lib/types.ts`
- [x] **No Game Logic Changes**: Display only, no mechanics affected

## Common Issues

**Issue**: Modal doesn't close on backdrop click
**Fix**: Ensure `onClick` is on the backdrop div, not the modal content div

**Issue**: Body still scrolls when modal is open
**Fix**: Check that the `useEffect` for body overflow is working

**Issue**: Images don't load
**Fix**: Add `onError` handler to img tag to hide broken images

**Issue**: Text too small on mobile
**Fix**: Use responsive text sizing: `text-sm md:text-base`

## Next Steps

After implementation:
1. Run `npm run build` to check for TypeScript errors
2. Run `npm run lint` to check for linting issues
3. Test manually in browser (use DevTools device emulation for mobile)
4. Test on actual mobile device if possible
5. Create PR with branch `001-show-unit-details`

## Files Changed

- `src/components/UnitDetailsModal.tsx` (NEW)
- `src/components/ArmyBuilder.tsx` (MODIFIED)
- `src/components/UnitSelector.tsx` (MODIFIED)

## Files Not Changed

- `src/lib/types.ts` (no new types needed)
- `src/data/*.json` (no data changes)
- `src/lib/game-logic.ts` (no game logic changes)
