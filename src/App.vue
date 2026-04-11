<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AccountGrid from './components/AccountGrid.vue'
import { useAccounts } from './composables/useAccounts'
import { useI18n } from './composables/useI18n'
import { useTicker } from './composables/useTicker'
import './styles/global.css'

const accountStore = useAccounts()
const i18n = useI18n()
const { now } = useTicker()
</script>

<template>
  <main class="app-shell">
    <AppHeader
      :title="i18n.t('app.title')"
      :search="accountStore.search.value"
      @update:search="accountStore.search.value = $event"
    />

    <AccountGrid :accounts="accountStore.filteredAccounts.value" :now="now" />
  </main>
</template>
