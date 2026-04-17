# 0002 - Layout Views Design Spec

## Summary

Add three switchable layout modes to the account card display: Grid (current), List (compact rows), and Circular (auto-rotating ring). Each layout supports drag-to-reorder via vuedraggable. Layout preference persists in localStorage.

## Layout Modes

### Grid (existing)
- Current responsive CSS grid layout, unchanged
- vuedraggable for reordering

### List
- Compact horizontal rows: avatar | service/account | token | progress bar
- All on one line, no card borders (just border-left accent)
- vuedraggable vertical reorder with insertion indicator

### Circular
- Cards arranged in a ring with depth scaling (near = large/opaque, far = small/faded)
- Auto-rotates continuously, pauses on hover
- Glow ring border around center for visual polish
- Mouse wheel adjusts rotation speed
- Drag a card onto another to swap positions
- Center label showing account count

## Layout Switcher

- Small toggle bar below the header, 3 icon buttons (grid/list/circular)
- Active button highlighted with theme accent color
- Persists to localStorage key `layout-preference`

## Drag Reorder

- Library: `vuedraggable` (based on SortableJS)
- On reorder: update `order` field on all accounts, call `persist()`
- Visual: drag ghost with reduced opacity, drop target highlight

## Component Structure

```
src/components/
  layout/
    LayoutSwitcher.vue       — 3-button toggle bar
    AccountGridLayout.vue    — grid layout (extracted)
    AccountListLayout.vue    — list layout
    AccountCircularLayout.vue — circular ring layout
  AccountGrid.vue            — thin wrapper, renders active layout
```

`AccountGrid.vue` reads layout mode from composable, renders the matching layout component. All layouts share the same props interface (accounts, now, labels) and emit the same events (copy, edit, delete).

## Composables

- `useLayoutPreference.ts` — layout mode ref + localStorage read/write
- Circular auto-rotation logic lives inside `AccountCircularLayout.vue` (not shared)

## Files Changed

- `src/components/AccountGrid.vue` — becomes wrapper
- `src/components/layout/LayoutSwitcher.vue` — new
- `src/components/layout/AccountGridLayout.vue` — new (extracted from current AccountGrid)
- `src/components/layout/AccountListLayout.vue` — new
- `src/components/layout/AccountCircularLayout.vue` — new
- `src/composables/useLayoutPreference.ts` — new
- `src/App.vue` — add LayoutSwitcher, wire layout mode
- `src/i18n/en.ts` — layout labels
- `src/i18n/zh.ts` — layout labels
- `package.json` — add vuedraggable dependency
- Tests for useLayoutPreference composable

## i18n Keys

```
'layout.grid' / 'layout.list' / 'layout.circular'
'layout.grid.title' / 'layout.list.title' / 'layout.circular.title'
```
