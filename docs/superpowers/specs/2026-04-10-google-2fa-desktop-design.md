# Google 2FA Desktop — Design Spec

## Overview

A desktop Google Authenticator compatible app built with Electron + Vue 3 + Vite. Displays TOTP codes in a 3-column card grid, supports importing/exporting Google Authenticator format, light/dark themes, and Chinese/English UI.

## Requirements

- **Platform:** Windows
- **Framework:** Electron + Vue 3 + Vite
- **Storage:** Electron localStorage (renderer process)
- **Security:** No password/master password — open and use immediately
- **i18n:** Chinese + English, follow system locale default
- **Theme:** Light + Dark, follow system preference default, manual toggle
- **Design System:** Apple Design per DESIGN.MD

## Architecture

```
google2fa/
├── electron/
│   └── main.js              # Electron main process
├── src/
│   ├── App.vue               # Root component
│   ├── main.js               # Vue entry point
│   ├── components/
│   │   ├── AppHeader.vue     # Title bar + toolbar
│   │   ├── AccountGrid.vue   # 3-column card grid
│   │   ├── AccountCard.vue   # Single TOTP card
│   │   ├── AddModal.vue      # Add account dialog
│   │   ├── ImportModal.vue   # Import dialog (QR/manual/file)
│   │   ├── ExportModal.vue   # Export dialog (QR/text)
│   │   └── SettingsModal.vue # Theme/language settings
│   ├── composables/
│   │   ├── useTOTP.js        # TOTP generation (HMAC-SHA1)
│   │   ├── useAccounts.js    # Account CRUD + localStorage persistence
│   │   ├── useTheme.js       # Light/dark theme toggle
│   │   └── useI18n.js        # i18n strings
│   ├── utils/
│   │   ├── totp.js           # Core TOTP algorithm
│   │   ├── otpauthUri.js     # Parse/build otpauth:// URIs
│   │   ├── qrHandler.js      # QR code encode/decode for import/export
│   │   └── exportFormat.js   # Google Authenticator export format compatibility
│   ├── i18n/
│   │   ├── zh.json           # Chinese strings
│   │   └── en.json           # English strings
│   └── styles/
│       ├── variables.css      # CSS custom properties (light/dark themes)
│       └── global.css         # Global styles per DESIGN.MD
├── package.json
├── vite.config.js
└── electron-builder.json      # Build config for Windows
```

## Core Features

### 1. TOTP Code Display

- Generate 6-digit TOTP codes using HMAC-SHA1 (RFC 6238)
- 30-second time step with countdown progress bar
- Auto-refresh codes before expiry
- Click code to copy to clipboard
- Cards display: avatar circle (first letter or icon), service name, account, code, progress bar

### 2. Account Management

- Add account manually: enter service name, account (email/username), secret key
- Edit account: change name, account label
- Delete account with confirmation
- Search/filter accounts

### 3. Import

Compatible with Google Authenticator mobile app export format:

- **QR Image Import:** Load QR code image file exported from Google Authenticator mobile. Decode the `otpauth-migration://offline?data=...` URL contained in the QR. Parse the protobuf-encoded account list (multiple accounts in one QR).
- **Manual Input:** Enter secret key directly
- **File Import:** Import a text file with `otpauth://` URIs (one per line)

### 4. Export

Compatible with Google Authenticator mobile app import:

- **Export as QR:** Encode selected accounts into `otpauth-migration://offline?data=...` QR code image. Support batch export (multiple accounts). Generate QR images that Google Authenticator mobile can scan to import.
- **Export as Text:** Copy `otpauth://totp/...` URI list to clipboard or save as file

### 5. Theme

Two themes following DESIGN.MD:

**Light:**
- Background: `#f5f5f7`
- Card: `#fff` with `rgba(0,0,0,0.04) 0px 2px 12px` shadow
- Text primary: `#1d1d1f`, secondary: `rgba(0,0,0,0.48)`
- Progress bar: `#0071e3`
- Button: `#fafafc` bg, `rgba(0,0,0,0.04)` border

**Dark:**
- Background: `#000000`
- Card: `#272729`
- Text primary: `#ffffff`, secondary: `rgba(255,255,255,0.48)`
- Progress bar: `#2997ff`
- Button: `#272729` bg

Default: follow system preference (`prefers-color-scheme`), manual toggle in settings.

### 6. Internationalization

- Chinese (zh) and English (en)
- Default: follow system locale
- Manual toggle in settings
- Store preference in localStorage

## UI Layout

### Main Window

- **Width:** ~900px default, resizable, min-width 640px
- **Height:** ~600px default, resizable, min-height 480px
- **Frameless:** Custom title bar with traffic lights (Windows: min/max/close buttons)
- **Header:** Title "验证码" / "Authenticator" on left, toolbar buttons on right (Add, Import, Export, Settings)
- **Body:** 3-column CSS grid of AccountCard components
- **Responsive:** 2 columns below 700px, 1 column below 480px

### Modals

All modals use centered overlay with backdrop blur.

- **Add Modal:** Form with service name, account, secret key inputs
- **Import Modal:** Tabbed — QR Image / Manual Input / File Import
- **Export Modal:** Two options — Export as QR / Export as Text, with account multi-select
- **Settings Modal:** Theme toggle (Light/Dark/System), Language toggle (中文/English/System)

## Data Model

```typescript
interface Account {
  id: string          // UUID
  service: string     // e.g. "Google"
  account: string     // e.g. "user@gmail.com"
  secret: string      // Base32 encoded secret key
  algorithm: string   // "SHA1" (default, per Google Authenticator)
  digits: number      // 6 (default)
  period: number      // 30 (default, seconds)
  icon?: string       // Optional: first letter auto-generated
  order: number       // Sort order
  createdAt: number   // Timestamp
}
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `vue` | UI framework |
| `electron` | Desktop runtime |
| `vite` | Build tool |
| `@electron-builder` | Package for Windows installer |
| `jsqrcode` or `qr-scanner` | Decode QR images for import |
| `qrcode` | Generate QR images for export |
| `protobufjs` | Parse Google Authenticator migration protobuf format |
| `jsSHA` or `otpauth` | TOTP/HOTP calculation |

## Google Authenticator Compatibility

The critical compatibility requirement is the `otpauth-migration://offline?data=...` format:

- **Import:** Decode QR → extract migration URL → base64 decode `data` parameter → parse protobuf Payload → extract Account entries (secret, name, issuer)
- **Export:** Build protobuf Payload from selected accounts → base64 encode → embed in `otpauth-migration://offline?data=...` URL → encode as QR image

Protobuf schema (Google's `MigrationPayload`):
```
message MigrationPayload {
  enum Algorithm { SHA1 = 0; SHA256 = 1; SHA512 = 2; SHA1 = 0; }
  enum DigitCount { SIX = 0; EIGHT = 1; }
  enum OtpType { HOTP = 0; TOTP = 1; }
  message OtpParameters {
    bytes secret = 1;
    string name = 2;
    string issuer = 3;
    Algorithm algorithm = 4;
    DigitCount digits = 5;
    OtpType type = 6;
    int64 counter = 7;
  }
  repeated OtpParameters otp_parameters = 1;
  int32 version = 2;
  int32 batch_size = 3;
  int32 batch_index = 4;
  int32 batch_id = 5;
}
```
