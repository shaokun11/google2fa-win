<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AccountGrid from './components/AccountGrid.vue'
import AddModal from './components/modals/AddModal.vue'
import { useAccounts } from './composables/useAccounts'
import { useI18n } from './composables/useI18n'
import { useTicker } from './composables/useTicker'
import './styles/global.css'

const accountStore = useAccounts()
const i18n = useI18n()
const { now } = useTicker()
const addModalOpen = ref(false)

const handleAddAccount = (payload: { service: string; account: string; secret: string }) => {
  accountStore.addAccount(payload)
  addModalOpen.value = false
}
</script>

<template>
  <main class="app-shell">
    <AppHeader
      :title="i18n.t('app.title')"
      :search="accountStore.search.value"
      @update:search="accountStore.search.value = $event"
      @add="addModalOpen = true"
    />

    <AccountGrid :accounts="accountStore.filteredAccounts.value" :now="now" />

    <AddModal
      :open="addModalOpen"
      @close="addModalOpen = false"
      @submit="handleAddAccount"
    />
  </main>
</template>
