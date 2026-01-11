# API Contracts

## Feature: Rules Version Selection

**Status**: No API contracts required

---

## Explanation

This feature is **entirely client-side** and does not require any API routes or server-side changes.

### Client-Side Only

All state management is handled through:
- **React useState** for component state
- **localStorage** for persistence (key: `bronepehota_rules_version`)
- **TypeScript configuration** for rules registry

### No Backend Changes Required

- No new API routes
- No modifications to existing API routes
- No database changes
- No file storage changes (existing JSON files in `src/data/` are unchanged)

### Data Flow

```
User Selection (UI)
        ↓
React State Update
        ↓
localStorage Write
        ↓
Registry Lookup (in-memory)
        ↓
Combat Calculations
```

All data remains on the client. No server communication is involved in rules version selection or switching.
