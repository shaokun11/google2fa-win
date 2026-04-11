# Google 2FA Desktop

Windows-first desktop Google Authenticator compatible app built with Electron and Vue.

## Current Status

Implemented:
- Electron + Vue desktop shell
- 3-column responsive token card grid
- TOTP generation and countdown progress
- Local account persistence
- Add account modal
- Google Authenticator migration URL encode/decode
- QR import helper and text/manual import modal
- QR/text export modal
- Theme and locale settings modal
- Chinese and English dictionaries

Verified:
- `npm run test` passes
- `npm run typecheck` passes
- `npm run build` passes
- `npm run dev` starts successfully

## Packaging Note

`npm run package` is currently blocked in this environment by Windows permission restrictions while `electron-builder` extracts `winCodeSign` cache files that contain symbolic links.

The application code and production build are ready, but generating the NSIS installer requires a Windows environment that can extract those cached archives successfully.

## Commands

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run build
npm run package
```
