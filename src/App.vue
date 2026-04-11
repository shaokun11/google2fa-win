<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AccountGrid from './components/AccountGrid.vue'
import AddModal from './components/modals/AddModal.vue'
import ExportModal from './components/modals/ExportModal.vue'
import ImportModal from './components/modals/ImportModal.vue'
import SettingsModal from './components/modals/SettingsModal.vue'
import { useAccounts } from './composables/useAccounts'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import { useTicker } from './composables/useTicker'
import { encodeMigrationUrl } from './utils/migrationProto'
import { stringifyOtpAuthUri } from './utils/otpauthUri'
import { generateQrDataUrl } from './utils/qr'
import './styles/global.css'

const accountStore = useAccounts()
const i18n = useI18n()
const theme = useTheme()
const { now } = useTicker()

const addModalOpen = ref(false)
const importModalOpen = ref(false)
const exportModalOpen = ref(false)
const settingsModalOpen = ref(false)
const exportPreview = ref('')

const handleAddAccount = (payload: { service: string; account: string; secret: string }) => {
  accountStore.addAccount(payload)
  addModalOpen.value = false
}

const handleImportAccounts = (accounts: Array<{ service: string; account: string; secret: string }>) => {
  accounts.forEach((account) => {
    accountStore.addAccount(account)
  })
  importModalOpen.value = false
}

const handleExportQr = async (accounts: typeof accountStore.accounts.value) => {
  if (accounts.length === 0) {
    return
  }

  const migrationUrl = encodeMigrationUrl(accounts)
  exportPreview.value = await generateQrDataUrl(migrationUrl)
}

const handleExportText = async (accounts: typeof accountStore.accounts.value) => {
  if (accounts.length === 0) {
    return
  }

  const text = accounts.map(stringifyOtpAuthUri).join('\n')

  if (window.electron?.copyText) {
    await window.electron.copyText(text)
  } else {
    await navigator.clipboard.writeText(text)
  }
}

const handleSaveSettings = (payload: { theme: 'system' | 'light' | 'dark'; locale: 'system' | 'en' | 'zh' }) => {
  theme.setTheme(payload.theme)
  i18n.setLocale(payload.locale)
  settingsModalOpen.value = false
}

const handleMinimize = async () => {
  if (window.electron?.minimizeWindow) {
    await window.electron.minimizeWindow()
  }
}

const handleClose = async () => {
  if (window.electron?.hideToTray) {
    await window.electron.hideToTray()
  }
}

const exportPreviewVisible = computed(() => exportPreview.value.length > 0)
</script>

<template>
  <main class="app-shell">
    <AppHeader
      :title="i18n.t('app.title')"
      :search="accountStore.search.value"
      @update:search="accountStore.search.value = $event"
      @add="addModalOpen = true"
      @import="importModalOpen = true"
      @export="exportModalOpen = true"
      @settings="settingsModalOpen = true"
      @minimize="handleMinimize"
      @close="handleClose"
    />

    <AccountGrid :accounts="accountStore.filteredAccounts.value" :now="now" />

    <AddModal
      :open="addModalOpen"
      @close="addModalOpen = false"
      @submit="handleAddAccount"
    />

    <ImportModal
      :open="importModalOpen"
      @close="importModalOpen = false"
      @import-accounts="handleImportAccounts"
    />

    <ExportModal
      :open="exportModalOpen"
      :accounts="accountStore.filteredAccounts.value"
      @close="exportModalOpen = false"
      @export-qr="handleExportQr"
      @export-text="handleExportText"
    />

    <SettingsModal
      :open="settingsModalOpen"
      :theme="theme.preference.value"
      :locale="i18n.locale.value"
      @close="settingsModalOpen = false"
      @save="handleSaveSettings"
    />

    <section v-if="exportPreviewVisible" class="export-preview">
      <h2 class="export-preview__title">Export QR Preview</h2>
      <img :src="exportPreview" alt="Export QR Preview" class="export-preview__image" />
    </section>
  </main>
</template>
