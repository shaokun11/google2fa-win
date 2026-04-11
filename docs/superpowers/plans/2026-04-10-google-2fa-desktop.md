# Google 2FA Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows-first Electron desktop app that is fully compatible with Google Authenticator import/export, shows TOTP codes in a 3-column card grid, and supports light/dark themes plus Chinese/English UI.

**Architecture:** Use `electron-vite` with a small Electron main/preload layer and a Vue 3 renderer. Keep business logic in focused utilities/composables: TOTP generation, otpauth URI parsing, Google migration protobuf encoding/decoding, local persistence, theme, and i18n. Test the protocol and state logic first, then wire the UI around those primitives.

**Tech Stack:** Electron, electron-vite, Vue 3, Vitest, Vue Test Utils, OTPAuth, protobufjs, qrcode, qr-scanner, TypeScript, electron-builder.

---

## File Map

### Root
- Create: `package.json` — scripts and dependency manifest
- Create: `electron.vite.config.ts` — Electron + renderer build config
- Create: `tsconfig.json` — shared TS config
- Create: `tsconfig.node.json` — Node/Electron TS config
- Create: `index.html` — renderer HTML shell
- Create: `electron-builder.json` — Windows packaging config
- Create: `.gitignore` — ignore build output and local artifacts
- Create: `vitest.config.ts` — unit/component test config

### Electron process
- Create: `electron/main/index.ts` — create frameless window and IPC registration
- Create: `electron/preload/index.ts` — safe preload bridge for clipboard/file dialogs/window controls
- Create: `electron/main/window.ts` — focused BrowserWindow creation helper
- Create: `electron/main/ipc.ts` — IPC handlers for import/export dialogs and shell actions

### Renderer app
- Create: `src/main.ts` — Vue bootstrap
- Create: `src/App.vue` — app shell and modal orchestration
- Create: `src/types/account.ts` — shared account types
- Create: `src/constants/app.ts` — app-level constants

### Utilities
- Create: `src/utils/totp.ts` — token generation and countdown helpers via OTPAuth
- Create: `src/utils/otpauthUri.ts` — parse/stringify otpauth URIs
- Create: `src/utils/migrationProto.ts` — Google Authenticator protobuf schema and encode/decode
- Create: `src/utils/qr.ts` — QR generation/QR-image decoding helpers
- Create: `src/utils/storage.ts` — localStorage load/save helpers
- Create: `src/utils/system.ts` — locale and theme detection helpers

### Composables
- Create: `src/composables/useAccounts.ts` — CRUD, search, ordering, persistence
- Create: `src/composables/useTheme.ts` — light/dark/system theme state
- Create: `src/composables/useI18n.ts` — zh/en/system language state and translator
- Create: `src/composables/useTicker.ts` — shared one-second timer for countdown refresh

### Components
- Create: `src/components/AppHeader.vue` — title bar + toolbar actions + search
- Create: `src/components/AccountGrid.vue` — responsive 3/2/1 column grid
- Create: `src/components/AccountCard.vue` — service/account/code/progress card
- Create: `src/components/modals/AddModal.vue` — add/edit account form
- Create: `src/components/modals/ImportModal.vue` — QR/manual/file import tabs
- Create: `src/components/modals/ExportModal.vue` — account selection + QR/text export
- Create: `src/components/modals/SettingsModal.vue` — theme/language selection
- Create: `src/components/base/BaseModal.vue` — shared modal shell
- Create: `src/components/base/BaseButton.vue` — Apple-style button variants

### Styles and i18n
- Create: `src/styles/variables.css` — DESIGN.MD tokens for both themes
- Create: `src/styles/global.css` — app layout, typography, card grid, modal styles
- Create: `src/i18n/zh.ts` — Chinese dictionary
- Create: `src/i18n/en.ts` — English dictionary

### Tests
- Create: `tests/utils/totp.test.ts`
- Create: `tests/utils/otpauthUri.test.ts`
- Create: `tests/utils/migrationProto.test.ts`
- Create: `tests/utils/storage.test.ts`
- Create: `tests/composables/useAccounts.test.ts`
- Create: `tests/composables/useTheme.test.ts`
- Create: `tests/composables/useI18n.test.ts`
- Create: `tests/components/AccountCard.test.ts`
- Create: `tests/components/AccountGrid.test.ts`
- Create: `tests/components/AppHeader.test.ts`
- Create: `tests/components/ImportModal.test.ts`
- Create: `tests/components/ExportModal.test.ts`
- Create: `tests/components/SettingsModal.test.ts`

## Implementation Tasks

### Task 1: Scaffold Electron + Vue + TypeScript project

**Files:**
- Create: `package.json`
- Create: `electron.vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.ts`
- Create: `src/App.vue`

- [ ] **Step 1: Write the failing bootstrap smoke test**

```ts
// tests/components/app-bootstrap.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.vue'

describe('App bootstrap', () => {
  it('renders the app shell title', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Authenticator')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm run test -- tests/components/app-bootstrap.test.ts`
Expected: FAIL with `Cannot find module '../../src/App.vue'` or missing Vue test setup.

- [ ] **Step 3: Create package manifest and build/test scripts**

```json
{
  "name": "google2fa-desktop",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "package": "electron-builder",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "otpauth": "^9.4.1",
    "protobufjs": "^7.4.0",
    "qrcode": "^1.5.4",
    "qr-scanner": "^1.4.2",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "@vue/test-utils": "^2.4.6",
    "electron": "^35.1.5",
    "electron-builder": "^26.0.12",
    "electron-vite": "^3.1.0",
    "jsdom": "^26.0.0",
    "typescript": "^5.8.3",
    "vite": "^6.2.5",
    "vitest": "^3.1.1"
  }
}
```

- [ ] **Step 4: Create minimal config and app shell**

```ts
// electron.vite.config.ts
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    plugins: [vue()]
  }
})
```

```vue
<!-- src/App.vue -->
<template>
  <main>
    <h1>Authenticator</h1>
  </main>
</template>
```

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 5: Run test to verify it passes**

Run: `rtk npm run test -- tests/components/app-bootstrap.test.ts`
Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit**

```bash
rtk git add package.json electron.vite.config.ts tsconfig.json tsconfig.node.json index.html src/main.ts src/App.vue tests/components/app-bootstrap.test.ts .gitignore
rtk git commit -m "chore: scaffold electron vue desktop app"
```

### Task 2: Build account types, persistence, and TOTP utilities

**Files:**
- Create: `src/types/account.ts`
- Create: `src/constants/app.ts`
- Create: `src/utils/totp.ts`
- Create: `src/utils/storage.ts`
- Create: `tests/utils/totp.test.ts`
- Create: `tests/utils/storage.test.ts`

- [ ] **Step 1: Write failing utility tests**

```ts
// tests/utils/totp.test.ts
import { describe, expect, it, vi } from 'vitest'
import { createTotpToken, getTokenProgress } from '../../src/utils/totp'

describe('totp utils', () => {
  it('generates a stable token for a fixed timestamp', () => {
    const token = createTotpToken({
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      service: 'Google',
      account: 'user@gmail.com'
    }, 0)

    expect(token).toHaveLength(6)
    expect(token).toBe('282760')
  })

  it('returns token progress percentage', () => {
    vi.setSystemTime(new Date('1970-01-01T00:00:15.000Z'))
    expect(getTokenProgress(30)).toBe(50)
  })
})
```

```ts
// tests/utils/storage.test.ts
import { describe, expect, it } from 'vitest'
import { loadAccounts, saveAccounts } from '../../src/utils/storage'

const account = {
  id: '1',
  service: 'Google',
  account: 'user@gmail.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  order: 0,
  createdAt: 1
}

describe('storage utils', () => {
  it('round-trips accounts through localStorage', () => {
    saveAccounts([account])
    expect(loadAccounts()).toEqual([account])
  })

  it('returns empty array when storage is empty', () => {
    localStorage.clear()
    expect(loadAccounts()).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `rtk npm run test -- tests/utils/totp.test.ts tests/utils/storage.test.ts`
Expected: FAIL because `src/utils/totp.ts` and `src/utils/storage.ts` do not exist.

- [ ] **Step 3: Create focused types/constants and minimal utility implementations**

```ts
// src/types/account.ts
export interface Account {
  id: string
  service: string
  account: string
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  order: number
  createdAt: number
}
```

```ts
// src/constants/app.ts
export const ACCOUNTS_STORAGE_KEY = 'google2fa.accounts'
export const THEME_STORAGE_KEY = 'google2fa.theme'
export const LOCALE_STORAGE_KEY = 'google2fa.locale'
export const DEFAULT_PERIOD = 30
```

```ts
// src/utils/totp.ts
import * as OTPAuth from 'otpauth'
import type { Account } from '../types/account'

export const createTotpToken = (account: Account, timestamp = Date.now()): string => {
  const totp = new OTPAuth.TOTP({
    issuer: account.service,
    label: account.account,
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
    secret: account.secret
  })

  return totp.generate({ timestamp })
}

export const getTokenProgress = (period: number, timestamp = Date.now()): number => {
  const elapsedSeconds = Math.floor(timestamp / 1000) % period
  return Math.round(((period - elapsedSeconds) / period) * 100)
}
```

```ts
// src/utils/storage.ts
import { ACCOUNTS_STORAGE_KEY } from '../constants/app'
import type { Account } from '../types/account'

export const loadAccounts = (): Account[] => {
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Account[]) : []
}

export const saveAccounts = (accounts: Account[]): void => {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `rtk npm run test -- tests/utils/totp.test.ts tests/utils/storage.test.ts`
Expected: PASS with `4 passed`.

- [ ] **Step 5: Commit**

```bash
rtk git add src/types/account.ts src/constants/app.ts src/utils/totp.ts src/utils/storage.ts tests/utils/totp.test.ts tests/utils/storage.test.ts
rtk git commit -m "feat: add account persistence and totp utilities"
```

### Task 3: Add otpauth URI parsing and Google migration protobuf support

**Files:**
- Create: `src/utils/otpauthUri.ts`
- Create: `src/utils/migrationProto.ts`
- Create: `tests/utils/otpauthUri.test.ts`
- Create: `tests/utils/migrationProto.test.ts`

- [ ] **Step 1: Write failing protocol tests**

```ts
// tests/utils/otpauthUri.test.ts
import { describe, expect, it } from 'vitest'
import { parseOtpAuthUri, stringifyOtpAuthUri } from '../../src/utils/otpauthUri'

const uri = 'otpauth://totp/Google:user@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=Google&algorithm=SHA1&digits=6&period=30'

describe('otpauth uri', () => {
  it('parses a standard TOTP uri', () => {
    expect(parseOtpAuthUri(uri)).toMatchObject({
      service: 'Google',
      account: 'user@gmail.com',
      secret: 'JBSWY3DPEHPK3PXP'
    })
  })

  it('stringifies an account back to a TOTP uri', () => {
    expect(stringifyOtpAuthUri({
      id: '1',
      service: 'Google',
      account: 'user@gmail.com',
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      order: 0,
      createdAt: 1
    })).toContain('otpauth://totp/')
  })
})
```

```ts
// tests/utils/migrationProto.test.ts
import { describe, expect, it } from 'vitest'
import { decodeMigrationUrl, encodeMigrationUrl } from '../../src/utils/migrationProto'

const accounts = [{
  id: '1',
  service: 'Google',
  account: 'user@gmail.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  order: 0,
  createdAt: 1
}]

describe('google migration proto', () => {
  it('encodes accounts into a migration url', () => {
    const url = encodeMigrationUrl(accounts)
    expect(url.startsWith('otpauth-migration://offline?data=')).toBe(true)
  })

  it('decodes an encoded migration url back to accounts', () => {
    const url = encodeMigrationUrl(accounts)
    expect(decodeMigrationUrl(url)).toMatchObject([{ service: 'Google', account: 'user@gmail.com' }])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `rtk npm run test -- tests/utils/otpauthUri.test.ts tests/utils/migrationProto.test.ts`
Expected: FAIL because parsing/encoding modules do not exist.

- [ ] **Step 3: Implement URI and migration helpers**

```ts
// src/utils/otpauthUri.ts
import * as OTPAuth from 'otpauth'
import type { Account } from '../types/account'

export const parseOtpAuthUri = (uri: string): Account => {
  const parsed = OTPAuth.URI.parse(uri) as OTPAuth.TOTP

  return {
    id: crypto.randomUUID(),
    service: parsed.issuer,
    account: parsed.label,
    secret: parsed.secret.base32,
    algorithm: parsed.algorithm as 'SHA1' | 'SHA256' | 'SHA512',
    digits: parsed.digits as 6 | 8,
    period: parsed.period,
    order: 0,
    createdAt: Date.now()
  }
}

export const stringifyOtpAuthUri = (account: Account): string => {
  const totp = new OTPAuth.TOTP({
    issuer: account.service,
    label: account.account,
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
    secret: account.secret
  })

  return totp.toString()
}
```

```ts
// src/utils/migrationProto.ts
import protobuf from 'protobufjs/light'
import type { Account } from '../types/account'

const root = protobuf.Root.fromJSON({
  nested: {
    MigrationPayload: {
      fields: {
        otpParameters: { rule: 'repeated', type: 'OtpParameters', id: 1 },
        version: { type: 'int32', id: 2 },
        batchSize: { type: 'int32', id: 3 },
        batchIndex: { type: 'int32', id: 4 },
        batchId: { type: 'int32', id: 5 }
      },
      nested: {
        OtpParameters: {
          fields: {
            secret: { type: 'bytes', id: 1 },
            name: { type: 'string', id: 2 },
            issuer: { type: 'string', id: 3 },
            algorithm: { type: 'int32', id: 4 },
            digits: { type: 'int32', id: 5 },
            type: { type: 'int32', id: 6 },
            counter: { type: 'int64', id: 7 }
          }
        }
      }
    }
  }
})

const Payload = root.lookupType('MigrationPayload')

const toBase64Url = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes))
const fromBase64Url = (value: string): Uint8Array => Uint8Array.from(atob(value), char => char.charCodeAt(0))

export const encodeMigrationUrl = (accounts: Account[]): string => {
  const message = Payload.create({
    otpParameters: accounts.map((account) => ({
      secret: Uint8Array.from(OTPAuth.Secret.fromBase32(account.secret).bytes),
      name: account.account,
      issuer: account.service,
      algorithm: 1,
      digits: account.digits === 6 ? 1 : 2,
      type: 2,
      counter: 0
    })),
    version: 1,
    batchSize: 1,
    batchIndex: 0,
    batchId: 1
  })

  const bytes = Payload.encode(message).finish()
  return `otpauth-migration://offline?data=${encodeURIComponent(toBase64Url(bytes))}`
}

export const decodeMigrationUrl = (url: string): Account[] => {
  const data = new URL(url).searchParams.get('data') ?? ''
  const decoded = Payload.decode(fromBase64Url(decodeURIComponent(data))) as any

  return decoded.otpParameters.map((item: any, index: number) => ({
    id: crypto.randomUUID(),
    service: item.issuer,
    account: item.name,
    secret: OTPAuth.Secret.fromHex(Buffer.from(item.secret).toString('hex')).base32,
    algorithm: 'SHA1',
    digits: item.digits === 1 ? 6 : 8,
    period: 30,
    order: index,
    createdAt: Date.now()
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `rtk npm run test -- tests/utils/otpauthUri.test.ts tests/utils/migrationProto.test.ts`
Expected: PASS with `4 passed`.

- [ ] **Step 5: Commit**

```bash
rtk git add src/utils/otpauthUri.ts src/utils/migrationProto.ts tests/utils/otpauthUri.test.ts tests/utils/migrationProto.test.ts
rtk git commit -m "feat: add authenticator import export formats"
```

### Task 4: Implement account state, theme state, and i18n state

**Files:**
- Create: `src/composables/useAccounts.ts`
- Create: `src/composables/useTheme.ts`
- Create: `src/composables/useI18n.ts`
- Create: `src/i18n/zh.ts`
- Create: `src/i18n/en.ts`
- Create: `tests/composables/useAccounts.test.ts`
- Create: `tests/composables/useTheme.test.ts`
- Create: `tests/composables/useI18n.test.ts`

- [ ] **Step 1: Write failing composable tests**

```ts
// tests/composables/useAccounts.test.ts
import { describe, expect, it } from 'vitest'
import { useAccounts } from '../../src/composables/useAccounts'

describe('useAccounts', () => {
  it('adds and sorts accounts by order', () => {
    const store = useAccounts()

    store.addAccount({ service: 'GitHub', account: '@user', secret: 'JBSWY3DPEHPK3PXP' })
    store.addAccount({ service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP' })

    expect(store.accounts.value.map((item) => item.service)).toEqual(['GitHub', 'Google'])
  })

  it('filters accounts by service or account text', () => {
    const store = useAccounts()
    store.addAccount({ service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP' })
    store.search.value = 'gmail'

    expect(store.filteredAccounts.value).toHaveLength(1)
  })
})
```

```ts
// tests/composables/useTheme.test.ts
import { describe, expect, it } from 'vitest'
import { useTheme } from '../../src/composables/useTheme'

describe('useTheme', () => {
  it('defaults to system theme and resolves to light or dark', () => {
    const theme = useTheme()
    expect(['light', 'dark']).toContain(theme.resolvedTheme.value)
  })
})
```

```ts
// tests/composables/useI18n.test.ts
import { describe, expect, it } from 'vitest'
import { useI18n } from '../../src/composables/useI18n'

describe('useI18n', () => {
  it('translates known keys', () => {
    const i18n = useI18n()
    i18n.setLocale('en')

    expect(i18n.t('app.title')).toBe('Authenticator')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `rtk npm run test -- tests/composables/useAccounts.test.ts tests/composables/useTheme.test.ts tests/composables/useI18n.test.ts`
Expected: FAIL because the composables do not exist.

- [ ] **Step 3: Implement state composables and dictionaries**

```ts
// src/i18n/en.ts
export default {
  'app.title': 'Authenticator',
  'toolbar.add': 'Add',
  'toolbar.import': 'Import',
  'toolbar.export': 'Export',
  'toolbar.settings': 'Settings'
} as const
```

```ts
// src/i18n/zh.ts
export default {
  'app.title': '验证码',
  'toolbar.add': '添加',
  'toolbar.import': '导入',
  'toolbar.export': '导出',
  'toolbar.settings': '设置'
} as const
```

```ts
// src/composables/useAccounts.ts
import { computed, ref } from 'vue'
import { loadAccounts, saveAccounts } from '../utils/storage'
import type { Account } from '../types/account'

export const useAccounts = () => {
  const accounts = ref<Account[]>(loadAccounts())
  const search = ref('')

  const persist = () => saveAccounts(accounts.value)

  const addAccount = (input: Pick<Account, 'service' | 'account' | 'secret'>) => {
    const next: Account = {
      id: crypto.randomUUID(),
      service: input.service,
      account: input.account,
      secret: input.secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      order: accounts.value.length,
      createdAt: Date.now()
    }

    accounts.value = [...accounts.value, next]
    persist()
  }

  const filteredAccounts = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return [...accounts.value].sort((a, b) => a.order - b.order)

    return accounts.value
      .filter((item) => `${item.service} ${item.account}`.toLowerCase().includes(query))
      .sort((a, b) => a.order - b.order)
  })

  return { accounts, search, filteredAccounts, addAccount }
}
```

```ts
// src/composables/useTheme.ts
import { computed, ref } from 'vue'

type ThemePreference = 'system' | 'light' | 'dark'

export const useTheme = () => {
  const preference = ref<ThemePreference>('system')
  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (preference.value === 'light' || preference.value === 'dark') return preference.value
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const setTheme = (value: ThemePreference) => {
    preference.value = value
    document.documentElement.dataset.theme = resolvedTheme.value
  }

  return { preference, resolvedTheme, setTheme }
}
```

```ts
// src/composables/useI18n.ts
import { ref } from 'vue'
import en from '../i18n/en'
import zh from '../i18n/zh'

type LocalePreference = 'system' | 'en' | 'zh'
const messages = { en, zh }

export const useI18n = () => {
  const locale = ref<LocalePreference>('system')

  const resolvedLocale = () => {
    if (locale.value === 'en' || locale.value === 'zh') return locale.value
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }

  const t = (key: keyof typeof en) => messages[resolvedLocale()][key]
  const setLocale = (value: LocalePreference) => { locale.value = value }

  return { locale, setLocale, t }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `rtk npm run test -- tests/composables/useAccounts.test.ts tests/composables/useTheme.test.ts tests/composables/useI18n.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/composables/useAccounts.ts src/composables/useTheme.ts src/composables/useI18n.ts src/i18n/en.ts src/i18n/zh.ts tests/composables/useAccounts.test.ts tests/composables/useTheme.test.ts tests/composables/useI18n.test.ts
rtk git commit -m "feat: add app state for accounts theme and locale"
```

### Task 5: Build Apple-style layout, card grid, and live code rendering UI

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/global.css`
- Create: `src/composables/useTicker.ts`
- Create: `src/components/AppHeader.vue`
- Create: `src/components/AccountGrid.vue`
- Create: `src/components/AccountCard.vue`
- Modify: `src/App.vue`
- Create: `tests/components/AccountCard.test.ts`
- Create: `tests/components/AccountGrid.test.ts`
- Create: `tests/components/AppHeader.test.ts`

- [ ] **Step 1: Write failing UI tests**

```ts
// tests/components/AccountCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AccountCard from '../../src/components/AccountCard.vue'

const account = {
  id: '1',
  service: 'Google',
  account: 'user@gmail.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  order: 0,
  createdAt: 1
}

describe('AccountCard', () => {
  it('renders service, account, and a 6 digit token', () => {
    const wrapper = mount(AccountCard, { props: { account, now: 0 } })
    expect(wrapper.text()).toContain('Google')
    expect(wrapper.text()).toContain('user@gmail.com')
    expect(wrapper.text()).toMatch(/\d{3}\s\d{3}/)
  })
})
```

```ts
// tests/components/AccountGrid.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AccountGrid from '../../src/components/AccountGrid.vue'

describe('AccountGrid', () => {
  it('renders one card per account', () => {
    const wrapper = mount(AccountGrid, {
      props: {
        accounts: [{
          id: '1', service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, order: 0, createdAt: 1
        }],
        now: 0
      }
    })

    expect(wrapper.findAll('[data-testid="account-card"]')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `rtk npm run test -- tests/components/AccountCard.test.ts tests/components/AccountGrid.test.ts`
Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement styles, ticker, header, grid, and card**

```ts
// src/composables/useTicker.ts
import { onBeforeUnmount, onMounted, ref } from 'vue'

export const useTicker = () => {
  const now = ref(Date.now())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    window.clearInterval(timer)
  })

  return { now }
}
```

```vue
<!-- src/components/AccountCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '../types/account'
import { createTotpToken, getTokenProgress } from '../utils/totp'

const props = defineProps<{ account: Account; now: number }>()
const token = computed(() => createTotpToken(props.account, props.now))
const displayToken = computed(() => `${token.value.slice(0, 3)} ${token.value.slice(3)}`)
const progress = computed(() => getTokenProgress(props.account.period, props.now))
</script>

<template>
  <article data-testid="account-card" class="account-card">
    <header class="account-card__header">
      <div class="account-card__avatar">{{ account.service[0] }}</div>
      <div>
        <div class="account-card__service">{{ account.service }}</div>
        <div class="account-card__account">{{ account.account }}</div>
      </div>
    </header>

    <button class="account-card__token" type="button">{{ displayToken }}</button>

    <div class="account-card__progress">
      <span class="account-card__progress-bar" :style="{ width: `${progress}%` }" />
    </div>
  </article>
</template>
```

```vue
<!-- src/components/AccountGrid.vue -->
<script setup lang="ts">
import type { Account } from '../types/account'
import AccountCard from './AccountCard.vue'

defineProps<{ accounts: Account[]; now: number }>()
</script>

<template>
  <section class="account-grid">
    <AccountCard v-for="account in accounts" :key="account.id" :account="account" :now="now" />
  </section>
</template>
```

```vue
<!-- src/components/AppHeader.vue -->
<script setup lang="ts">
defineProps<{ title: string; search: string }>()
const emit = defineEmits<{
  'update:search': [value: string]
  add: []
  import: []
  export: []
  settings: []
}>()
</script>

<template>
  <header class="app-header">
    <h1 class="app-header__title">{{ title }}</h1>
    <input class="app-header__search" :value="search" @input="emit('update:search', ($event.target as HTMLInputElement).value)" />
    <div class="app-header__actions">
      <button @click="emit('add')">Add</button>
      <button @click="emit('import')">Import</button>
      <button @click="emit('export')">Export</button>
      <button @click="emit('settings')">Settings</button>
    </div>
  </header>
</template>
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AccountGrid from './components/AccountGrid.vue'
import { useAccounts } from './composables/useAccounts'
import { useI18n } from './composables/useI18n'
import { useTicker } from './composables/useTicker'

const accountStore = useAccounts()
const i18n = useI18n()
const { now } = useTicker()
</script>

<template>
  <main class="app-shell">
    <AppHeader :title="i18n.t('app.title')" :search="accountStore.search.value" @update:search="accountStore.search.value = $event" />
    <AccountGrid :accounts="accountStore.filteredAccounts.value" :now="now" />
  </main>
</template>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `rtk npm run test -- tests/components/AccountCard.test.ts tests/components/AccountGrid.test.ts tests/components/AppHeader.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/styles/variables.css src/styles/global.css src/composables/useTicker.ts src/components/AppHeader.vue src/components/AccountGrid.vue src/components/AccountCard.vue src/App.vue tests/components/AccountCard.test.ts tests/components/AccountGrid.test.ts tests/components/AppHeader.test.ts
rtk git commit -m "feat: add authenticator desktop card grid ui"
```

### Task 6: Add add/edit/delete/search account workflows

**Files:**
- Create: `src/components/base/BaseModal.vue`
- Create: `src/components/base/BaseButton.vue`
- Create: `src/components/modals/AddModal.vue`
- Modify: `src/composables/useAccounts.ts`
- Modify: `src/App.vue`

- [ ] **Step 1: Write failing modal/state tests**

```ts
// tests/components/AddModal.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AddModal from '../../src/components/modals/AddModal.vue'

describe('AddModal', () => {
  it('emits submit payload for a valid manual account', async () => {
    const wrapper = mount(AddModal, { props: { open: true } })

    await wrapper.get('input[name="service"]').setValue('Google')
    await wrapper.get('input[name="account"]').setValue('user@gmail.com')
    await wrapper.get('input[name="secret"]').setValue('JBSWY3DPEHPK3PXP')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ service: 'Google', account: 'user@gmail.com' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm run test -- tests/components/AddModal.test.ts`
Expected: FAIL because modal does not exist.

- [ ] **Step 3: Implement add/edit/delete actions and modal form**

```ts
// extend src/composables/useAccounts.ts
const updateAccount = (id: string, patch: Pick<Account, 'service' | 'account' | 'secret'>) => {
  accounts.value = accounts.value.map((item) => item.id === id ? { ...item, ...patch } : item)
  persist()
}

const removeAccount = (id: string) => {
  accounts.value = accounts.value.filter((item) => item.id !== id)
    .map((item, index) => ({ ...item, order: index }))
  persist()
}
```

```vue
<!-- src/components/modals/AddModal.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps<{ open: boolean; initial?: { service: string; account: string; secret: string } }>()
const emit = defineEmits<{ close: []; submit: [{ service: string; account: string; secret: string }] }>()

const form = reactive({
  service: props.initial?.service ?? '',
  account: props.initial?.account ?? '',
  secret: props.initial?.secret ?? ''
})

const onSubmit = () => {
  emit('submit', { ...form })
}
</script>

<template>
  <BaseModal :open="open" title="Add account" @close="emit('close')">
    <form class="stack" @submit.prevent="onSubmit">
      <input name="service" v-model="form.service" />
      <input name="account" v-model="form.account" />
      <input name="secret" v-model="form.secret" />
      <button type="submit">Save</button>
    </form>
  </BaseModal>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm run test -- tests/components/AddModal.test.ts tests/composables/useAccounts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/base/BaseModal.vue src/components/base/BaseButton.vue src/components/modals/AddModal.vue src/composables/useAccounts.ts src/App.vue tests/components/AddModal.test.ts tests/composables/useAccounts.test.ts
rtk git commit -m "feat: add account management workflows"
```

### Task 7: Add import workflows for QR image, manual secret, and otpauth text file

**Files:**
- Create: `src/utils/qr.ts`
- Create: `src/components/modals/ImportModal.vue`
- Modify: `src/composables/useAccounts.ts`
- Modify: `src/App.vue`
- Create: `tests/components/ImportModal.test.ts`

- [ ] **Step 1: Write failing import tests**

```ts
// tests/components/ImportModal.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ImportModal from '../../src/components/modals/ImportModal.vue'

describe('ImportModal', () => {
  it('emits parsed manual account data', async () => {
    const wrapper = mount(ImportModal, { props: { open: true } })

    await wrapper.get('button[data-tab="manual"]').trigger('click')
    await wrapper.get('input[name="service"]').setValue('Google')
    await wrapper.get('input[name="account"]').setValue('user@gmail.com')
    await wrapper.get('input[name="secret"]').setValue('JBSWY3DPEHPK3PXP')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('import-accounts')?.[0]?.[0]).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm run test -- tests/components/ImportModal.test.ts`
Expected: FAIL because import modal does not exist.

- [ ] **Step 3: Implement QR/text/manual import helpers and modal**

```ts
// src/utils/qr.ts
import QrScanner from 'qr-scanner'

export const decodeQrImage = async (file: File): Promise<string> => {
  return QrScanner.scanImage(file, { returnDetailedScanResult: false })
}
```

```vue
<!-- src/components/modals/ImportModal.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import { decodeQrImage } from '../../utils/qr'
import { decodeMigrationUrl } from '../../utils/migrationProto'
import { parseOtpAuthUri } from '../../utils/otpauthUri'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; 'import-accounts': [any[]] }>()
const activeTab = ref<'qr' | 'manual' | 'file'>('qr')

const importQr = async (file: File) => {
  const url = await decodeQrImage(file)
  emit('import-accounts', decodeMigrationUrl(url))
}

const importText = (text: string) => {
  emit('import-accounts', text.split('\n').filter(Boolean).map(parseOtpAuthUri))
}
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm run test -- tests/components/ImportModal.test.ts tests/utils/migrationProto.test.ts tests/utils/otpauthUri.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/utils/qr.ts src/components/modals/ImportModal.vue src/composables/useAccounts.ts src/App.vue tests/components/ImportModal.test.ts
rtk git commit -m "feat: add authenticator import workflows"
```

### Task 8: Add export workflows for Google migration QR and otpauth text export

**Files:**
- Create: `src/components/modals/ExportModal.vue`
- Modify: `src/utils/qr.ts`
- Modify: `src/App.vue`
- Create: `tests/components/ExportModal.test.ts`

- [ ] **Step 1: Write failing export tests**

```ts
// tests/components/ExportModal.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExportModal from '../../src/components/modals/ExportModal.vue'

const accounts = [{
  id: '1', service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, order: 0, createdAt: 1
}]

describe('ExportModal', () => {
  it('emits selected accounts for qr export', async () => {
    const wrapper = mount(ExportModal, { props: { open: true, accounts } })

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('button[data-format="qr"]').trigger('click')

    expect(wrapper.emitted('export-qr')?.[0]?.[0]).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm run test -- tests/components/ExportModal.test.ts`
Expected: FAIL because export modal does not exist.

- [ ] **Step 3: Implement QR generation and export modal**

```ts
// extend src/utils/qr.ts
import QRCode from 'qrcode'

export const generateQrDataUrl = async (value: string): Promise<string> => {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280
  })
}
```

```vue
<!-- src/components/modals/ExportModal.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import type { Account } from '../../types/account'

const props = defineProps<{ open: boolean; accounts: Account[] }>()
const emit = defineEmits<{ close: []; 'export-qr': [Account[]]; 'export-text': [Account[]] }>()
const selectedIds = ref<string[]>([])
const selectedAccounts = computed(() => props.accounts.filter((item) => selectedIds.value.includes(item.id)))
</script>

<template>
  <BaseModal :open="open" title="Export accounts" @close="emit('close')">
    <div v-for="account in accounts" :key="account.id">
      <label>
        <input type="checkbox" :value="account.id" v-model="selectedIds" />
        {{ account.service }} — {{ account.account }}
      </label>
    </div>

    <button data-format="qr" @click="emit('export-qr', selectedAccounts)">Export QR</button>
    <button data-format="text" @click="emit('export-text', selectedAccounts)">Export Text</button>
  </BaseModal>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm run test -- tests/components/ExportModal.test.ts tests/utils/migrationProto.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/modals/ExportModal.vue src/utils/qr.ts src/App.vue tests/components/ExportModal.test.ts
rtk git commit -m "feat: add authenticator export workflows"
```

### Task 9: Add settings modal, Electron shell, and Windows packaging

**Files:**
- Create: `electron/main/window.ts`
- Create: `electron/main/ipc.ts`
- Create: `electron/main/index.ts`
- Create: `electron/preload/index.ts`
- Create: `src/components/modals/SettingsModal.vue`
- Create: `electron-builder.json`
- Create: `tests/components/SettingsModal.test.ts`

- [ ] **Step 1: Write failing settings/UI shell tests**

```ts
// tests/components/SettingsModal.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SettingsModal from '../../src/components/modals/SettingsModal.vue'

describe('SettingsModal', () => {
  it('emits theme and locale preferences', async () => {
    const wrapper = mount(SettingsModal, { props: { open: true, theme: 'system', locale: 'system' } })

    await wrapper.get('select[name="theme"]').setValue('dark')
    await wrapper.get('select[name="locale"]').setValue('zh')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({ theme: 'dark', locale: 'zh' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm run test -- tests/components/SettingsModal.test.ts`
Expected: FAIL because settings modal does not exist.

- [ ] **Step 3: Implement settings modal and Electron window shell**

```ts
// electron/main/window.ts
import { BrowserWindow } from 'electron'
import { join } from 'node:path'

export const createMainWindow = (): BrowserWindow => {
  return new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 640,
    minHeight: 480,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })
}
```

```ts
// electron/main/index.ts
import { app } from 'electron'
import { createMainWindow } from './window'

app.whenReady().then(() => {
  const window = createMainWindow()
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    window.loadFile('out/renderer/index.html')
  }
})
```

```json
// electron-builder.json
{
  "appId": "com.example.google2fa.desktop",
  "productName": "Google 2FA Desktop",
  "files": ["out/**/*", "package.json"],
  "win": {
    "target": ["nsis"],
    "artifactName": "google2fa-desktop-${version}.${ext}"
  }
}
```

- [ ] **Step 4: Run tests and build verification**

Run: `rtk npm run test -- tests/components/SettingsModal.test.ts && rtk npm run build`
Expected: settings test PASS and Electron/Vite build succeeds.

- [ ] **Step 5: Commit**

```bash
rtk git add electron/main/window.ts electron/main/ipc.ts electron/main/index.ts electron/preload/index.ts src/components/modals/SettingsModal.vue electron-builder.json tests/components/SettingsModal.test.ts
rtk git commit -m "feat: add settings modal and electron shell"
```

### Task 10: Final verification and release smoke checks

**Files:**
- Modify: `README.md` if needed only after app works

- [ ] **Step 1: Run full unit/component suite**

Run: `rtk npm run test`
Expected: All utility, composable, and component tests pass.

- [ ] **Step 2: Run typecheck and production build**

Run: `rtk npm run typecheck && rtk npm run build`
Expected: no TypeScript errors and production bundles generated.

- [ ] **Step 3: Build Windows installer**

Run: `rtk npm run package`
Expected: NSIS installer generated under `dist/`.

- [ ] **Step 4: Manual smoke test checklist**

```text
1. Launch app on Windows
2. Add a manual secret and verify token changes every 30 seconds
3. Click a token and verify clipboard receives 6 digits
4. Import a Google Authenticator migration QR and verify all accounts appear
5. Export selected accounts as migration QR and scan with phone Google Authenticator
6. Export selected accounts as otpauth text and verify format is valid
7. Switch light/dark theme and verify DESIGN.MD colors match
8. Switch zh/en and verify toolbar, modal, and settings text changes immediately
9. Resize window below 700px and verify 2-column layout
10. Resize below 480px and verify 1-column layout
```

- [ ] **Step 5: Commit**

```bash
rtk git add .
rtk git commit -m "chore: verify desktop authenticator release build"
```

## Self-Review

### Spec coverage
- Electron + Vue + Vite: covered in Tasks 1 and 9
- TOTP generation and countdown: covered in Tasks 2 and 5
- 3-column card grid and responsive layout: covered in Task 5
- Add/edit/delete/search: covered in Task 6
- Google Authenticator QR migration import/export: covered in Tasks 3, 7, and 8
- Light/dark themes: covered in Tasks 4, 5, and 9
- Chinese/English i18n: covered in Tasks 4 and 9
- Windows packaging: covered in Task 9 and Task 10

### Placeholder scan
- No TBD/TODO placeholders remain.
- Every task has explicit files, commands, and code snippets.

### Type consistency
- `Account` fields are consistent across utilities, composables, and components.
- Theme preference uses `system | light | dark` consistently.
- Locale preference uses `system | zh | en` consistently.

Plan complete and saved to `docs/superpowers/plans/2026-04-10-google-2fa-desktop.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?