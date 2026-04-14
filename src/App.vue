<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AccountGrid from './components/AccountGrid.vue'
import AddModal from './components/modals/AddModal.vue'
import ExportModal from './components/modals/ExportModal.vue'
import ExportPreviewModal from './components/modals/ExportPreviewModal.vue'
import ImportModal from './components/modals/ImportModal.vue'
import SettingsModal from './components/modals/SettingsModal.vue'
import { useAccounts } from './composables/useAccounts'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import { useTicker } from './composables/useTicker'
import { useWaterRipple } from './composables/useWaterRipple'
import { encodeMigrationUrl } from './utils/migrationProto'
import { stringifyOtpAuthUri } from './utils/otpauthUri'
import { generateQrDataUrl } from './utils/qr'
import './styles/global.css'

const accountStore = useAccounts()
const i18n = useI18n()
const theme = useTheme()
const { now } = useTicker()

const appShellRef = ref<HTMLElement | null>(null)
useWaterRipple(() => appShellRef.value)

const addModalOpen = ref(false)
const editModalOpen = ref(false)
const importModalOpen = ref(false)
const exportModalOpen = ref(false)
const settingsModalOpen = ref(false)
const exportPreviewOpen = ref(false)
const exportPreview = ref('')
const editingAccount = ref<ReturnType<typeof accountStore['filteredAccounts']['value'][number] | null>>(null)

const handleAddAccount = (payload: { service: string; account: string; secret: string }) => {
  accountStore.addAccount(payload)
  addModalOpen.value = false
}

const handleEditAccount = (account: ReturnType<typeof accountStore['filteredAccounts']['value'][number]>) => {
  editingAccount.value = account
  editModalOpen.value = true
}

const handleUpdateAccount = (payload: { service: string; account: string; secret: string }) => {
  if (editingAccount.value) {
    accountStore.updateAccount(editingAccount.value.id, payload)
  }
  editingAccount.value = null
  editModalOpen.value = false
}

const handleDeleteAccount = (id: string) => {
  accountStore.removeAccount(id)
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
  exportModalOpen.value = false
  exportPreviewOpen.value = true
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

const handleSaveSettings = (payload: { theme: 'system' | 'light' | 'dark' | 'one-dark'; locale: 'system' | 'en' | 'zh' }) => {
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

const handleCopyToken = async (token: string) => {
  if (window.electron?.copyText) {
    await window.electron.copyText(token)
  } else {
    await navigator.clipboard.writeText(token)
  }
}
</script>

<template>
  <main class="app-shell" ref="appShellRef">
    <AppHeader
      :title="i18n.t('app.title')"
      subtitle="Google 2FA Desktop"
      :search="accountStore.search.value"
      :search-placeholder="i18n.t('toolbar.searchPlaceholder')"
      :labels="{
        add: i18n.t('toolbar.add'),
        import: i18n.t('toolbar.import'),
        export: i18n.t('toolbar.export'),
        settings: i18n.t('toolbar.settings')
      }"
      @update:search="accountStore.search.value = $event"
      @add="addModalOpen = true"
      @import="importModalOpen = true"
      @export="exportModalOpen = true"
      @settings="settingsModalOpen = true"
    />

    <AccountGrid
      :accounts="accountStore.filteredAccounts.value"
      :now="now"
      :empty-title="i18n.t('empty.title')"
      :empty-description="i18n.t('empty.description')"
      :card-copy-hint="i18n.t('card.copyHint')"
      :card-copied-text="i18n.t('card.copied')"
      :card-edit-text="i18n.t('card.edit')"
      :card-delete-text="i18n.t('card.delete')"
      :card-delete-confirm-label="i18n.t('card.deleteConfirmLabel')"
      :card-delete-confirm-placeholder="i18n.t('card.deleteConfirmPlaceholder')"
      @copy="handleCopyToken"
      @edit="handleEditAccount"
      @delete="handleDeleteAccount"
    />

    <AddModal
      :open="addModalOpen"
      mode="add"
      :labels="{
        titleAdd: i18n.t('modal.add.title'),
        titleEdit: i18n.t('modal.edit.title'),
        descriptionAdd: i18n.t('modal.add.description'),
        descriptionEdit: i18n.t('modal.edit.description'),
        serviceLabel: i18n.t('modal.add.serviceLabel'),
        servicePlaceholder: i18n.t('modal.add.servicePlaceholder'),
        accountLabel: i18n.t('modal.add.accountLabel'),
        accountPlaceholder: i18n.t('modal.add.accountPlaceholder'),
        secretLabel: i18n.t('modal.add.secretLabel'),
        secretPlaceholder: i18n.t('modal.add.secretPlaceholder'),
        cancel: i18n.t('modal.cancel'),
        saveAccount: i18n.t('modal.add.saveAccount'),
        saveChanges: i18n.t('modal.edit.saveChanges')
      }"
      @close="addModalOpen = false"
      @submit="handleAddAccount"
    />

    <AddModal
      :open="editModalOpen"
      mode="edit"
      :initial="editingAccount ? { service: editingAccount.service, account: editingAccount.account, secret: editingAccount.secret } : undefined"
      :labels="{
        titleAdd: i18n.t('modal.add.title'),
        titleEdit: i18n.t('modal.edit.title'),
        descriptionAdd: i18n.t('modal.add.description'),
        descriptionEdit: i18n.t('modal.edit.description'),
        serviceLabel: i18n.t('modal.add.serviceLabel'),
        servicePlaceholder: i18n.t('modal.add.servicePlaceholder'),
        accountLabel: i18n.t('modal.add.accountLabel'),
        accountPlaceholder: i18n.t('modal.add.accountPlaceholder'),
        secretLabel: i18n.t('modal.add.secretLabel'),
        secretPlaceholder: i18n.t('modal.add.secretPlaceholder'),
        cancel: i18n.t('modal.cancel'),
        saveAccount: i18n.t('modal.add.saveAccount'),
        saveChanges: i18n.t('modal.edit.saveChanges')
      }"
      @close="editModalOpen = false; editingAccount = null"
      @submit="handleUpdateAccount"
    />

    <ImportModal
      :open="importModalOpen"
      :labels="{
        title: i18n.t('modal.import.title'),
        tabQr: i18n.t('modal.import.tab.qr'),
        tabFile: i18n.t('modal.import.tab.file'),
        manualImport: i18n.t('modal.import.manual.import'),
        filePlaceholder: i18n.t('modal.import.file.placeholder'),
        qrHint: i18n.t('modal.import.qr.hint'),
        qrButton: i18n.t('modal.import.qr.button')
      }"
      @close="importModalOpen = false"
      @import-accounts="handleImportAccounts"
    />

    <ExportModal
      :open="exportModalOpen"
      :accounts="accountStore.filteredAccounts.value"
      :labels="{
        title: i18n.t('modal.export.title'),
        selectAll: i18n.t('modal.export.selectAll'),
        exportQr: i18n.t('modal.export.exportQr'),
        exportText: i18n.t('modal.export.exportText'),
        copied: i18n.t('modal.export.copied')
      }"
      @close="exportModalOpen = false"
      @export-qr="handleExportQr"
      @export-text="handleExportText"
    />

    <SettingsModal
      :open="settingsModalOpen"
      :theme="theme.preference.value"
      :locale="i18n.locale.value"
      :labels="{
        title: i18n.t('modal.settings.title'),
        themeLabel: i18n.t('modal.settings.theme'),
        themeSystem: i18n.t('modal.settings.theme.system'),
        themeLight: i18n.t('modal.settings.theme.light'),
        themeDark: i18n.t('modal.settings.theme.dark'),
        themeOneDark: i18n.t('modal.settings.theme.oneDark'),
        languageLabel: i18n.t('modal.settings.language'),
        languageSystem: i18n.t('modal.settings.language.system'),
        languageEn: i18n.t('modal.settings.language.en'),
        languageZh: i18n.t('modal.settings.language.zh'),
        save: i18n.t('modal.save')
      }"
      @close="settingsModalOpen = false"
      @save="handleSaveSettings"
    />

    <ExportPreviewModal
      :open="exportPreviewOpen"
      :title="i18n.t('modal.exportPreview.title')"
      :image-src="exportPreview"
      @close="exportPreviewOpen = false"
    />
  </main>
</template>
