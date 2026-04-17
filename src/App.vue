<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AccountGrid from './components/AccountGrid.vue'
import AddModal from './components/modals/AddModal.vue'
import ExportModal from './components/modals/ExportModal.vue'
import ExportPreviewModal from './components/modals/ExportPreviewModal.vue'
import BatchDeleteModal from './components/modals/BatchDeleteModal.vue'
import ImportModal from './components/modals/ImportModal.vue'
import SettingsModal from './components/modals/SettingsModal.vue'
import { useAccounts } from './composables/useAccounts'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import { useTicker } from './composables/useTicker'
import { useWaterRipple } from './composables/useWaterRipple'
import { useLayoutPreference } from './composables/useLayoutPreference'
import LayoutSwitcher from './components/layout/LayoutSwitcher.vue'
import { encodeMigrationUrl } from './utils/migrationProto'
import { generateQrDataUrl } from './utils/qr'
import './styles/global.css'

const accountStore = useAccounts()
const i18n = useI18n()
const theme = useTheme()
const { now } = useTicker()
const layoutPref = useLayoutPreference()

const appShellRef = ref<HTMLElement | null>(null)
useWaterRipple(() => appShellRef.value)

const addModalOpen = ref(false)
const editModalOpen = ref(false)
const importModalOpen = ref(false)
const exportModalOpen = ref(false)
const settingsModalOpen = ref(false)
const exportPreviewOpen = ref(false)
const batchDeleteOpen = ref(false)
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

const handleBatchDelete = (ids: string[]) => {
  ids.forEach((id) => accountStore.removeAccount(id))
  batchDeleteOpen.value = false
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

  const text = encodeMigrationUrl(accounts)

  if (window.electron?.copyText) {
    await window.electron.copyText(text)
  } else {
    await navigator.clipboard.writeText(text)
  }
}

const handleExportFile = async (accounts: typeof accountStore.accounts.value) => {
  if (accounts.length === 0) {
    return
  }

  const text = encodeMigrationUrl(accounts)

  if (window.electron?.saveFile) {
    await window.electron.saveFile(text, 'google2fa-export.txt')
  } else {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'google2fa-export.txt'
    a.click()
    URL.revokeObjectURL(url)
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

const handleReorder = (reordered: typeof accountStore.accounts.value) => {
  accountStore.accounts.value = reordered
  accountStore.persist()
}
</script>

<template>
  <main class="app-shell" ref="appShellRef">
    <div class="drag-bar"></div>
    <AppHeader
      :title="i18n.t('app.title')"
      subtitle="Google 2FA Desktop"
      :search="accountStore.search.value"
      :search-placeholder="i18n.t('toolbar.searchPlaceholder')"
      :labels="{
        add: i18n.t('toolbar.add'),
        import: i18n.t('toolbar.import'),
        export: i18n.t('toolbar.export'),
        settings: i18n.t('toolbar.settings'),
        batchDelete: i18n.t('toolbar.batchDelete')
      }"
      @update:search="accountStore.search.value = $event"
      @add="addModalOpen = true"
      @import="importModalOpen = true"
      @export="exportModalOpen = true"
      @settings="settingsModalOpen = true"
      @batch-delete="batchDeleteOpen = true"
    />

    <div class="layout-bar">
      <LayoutSwitcher
        :mode="layoutPref.mode.value"
        :labels="{
          grid: i18n.t('layout.grid'),
          list: i18n.t('layout.list'),
          circular: i18n.t('layout.circular')
        }"
        @change="layoutPref.setMode"
      />
    </div>

    <AccountGrid
      :mode="layoutPref.mode.value"
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
      @reorder="handleReorder"
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
        exportFile: i18n.t('modal.export.exportFile'),
        copied: i18n.t('modal.export.copied'),
        saved: i18n.t('modal.export.saved')
      }"
      @close="exportModalOpen = false"
      @export-qr="handleExportQr"
      @export-text="handleExportText"
      @export-file="handleExportFile"
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

    <BatchDeleteModal
      :open="batchDeleteOpen"
      :accounts="accountStore.filteredAccounts.value"
      :labels="{
        title: i18n.t('modal.batchDelete.title'),
        selectAll: i18n.t('modal.batchDelete.selectAll'),
        deleteButton: i18n.t('modal.batchDelete.deleteButton'),
        confirmLabel: i18n.t('modal.batchDelete.confirmLabel'),
        confirmPlaceholder: i18n.t('modal.batchDelete.confirmPlaceholder'),
        count: i18n.t('modal.batchDelete.count')
      }"
      @close="batchDeleteOpen = false"
      @delete-confirmed="handleBatchDelete"
    />
  </main>
</template>
