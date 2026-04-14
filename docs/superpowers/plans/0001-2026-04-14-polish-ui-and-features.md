# Polish UI and Complete Remaining Features

## Scope

Complete the unfinished functionality and apply Apple Design System (DESIGN.MD) to make the desktop authenticator visually polished and fully usable.

## Files Affected

- `src/App.vue` — add edit/delete/export-preview modal orchestration
- `src/components/AccountCard.vue` — add edit/delete actions, polish card UI
- `src/components/AccountGrid.vue` — add empty state
- `src/components/AppHeader.vue` — polish header, improve window controls
- `src/components/base/BaseModal.vue` — add animation, close icon
- `src/components/modals/AddModal.vue` — i18n, use as edit modal too
- `src/components/modals/ImportModal.vue` — i18n, active tab styles
- `src/components/modals/ExportModal.vue` — i18n, improved layout
- `src/components/modals/SettingsModal.vue` — i18n, improved layout
- `src/composables/useTheme.ts` — add localStorage persistence
- `src/composables/useI18n.ts` — add localStorage persistence
- `src/i18n/en.ts` — expand dictionary
- `src/i18n/zh.ts` — expand dictionary
- `src/styles/global.css` — refine Apple-style spacing, shadows, transitions
- `src/styles/variables.css` — add missing CSS variables (if needed)

## Step-by-Step Actions

1. **Persist theme and locale**
   - Extend `useTheme` to read/write `google2fa.theme` from localStorage.
   - Extend `useI18n` to read/write `google2fa.locale` from localStorage.

2. **Expand i18n dictionaries**
   - Add keys for all UI labels: modals, buttons, placeholders, empty state, tooltips, confirm messages.

3. **Polish global styles**
   - Tighten typography to match DESIGN.MD (SF Pro optical sizing, negative tracking).
   - Refine card shadows, header glass, modal backdrop.
   - Add transitions/animations for modal open/close.

4. **Improve AppHeader**
   - Replace raw `_` / `×` with styled window controls.
   - Better search input styling and i18n placeholder.

5. **Improve AccountCard**
   - Larger avatar with service initial and subtle gradient.
   - Edit/delete icon buttons on hover.
   - Copy feedback animation.

6. **Add empty state to AccountGrid**
   - Show friendly illustration/message when no accounts exist.

7. **Add edit and delete workflows**
   - `AccountCard` emits `edit` and `delete`.
   - `App.vue` handles edit by opening `AddModal` in edit mode.
   - `App.vue` handles delete with a simple inline confirmation (or immediate delete).

8. **Move export QR preview into a modal**
   - Create a lightweight `ExportPreviewModal` or reuse `BaseModal` in `App.vue`.
   - Remove the old `export-preview` section from the main layout.

9. **Polish all modals**
   - Consistent form spacing, labels, buttons.
   - Active tab visual state in `ImportModal`.
   - i18n everywhere.

10. **Verify**
    - Run `npm run test` — all tests pass.
    - Run `npm run build` — no errors.
    - Run `npm run typecheck` — no errors.

## Expected Outcome

- Theme and locale preferences survive app restarts.
- Every visible string is translatable (zh/en).
- UI looks polished and Apple-like: clean cards, refined header, smooth modals.
- Users can edit and delete accounts.
- Export QR preview shows in a modal, not the main page.
- Empty state guides first-time users.
