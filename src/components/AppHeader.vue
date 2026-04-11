<script setup lang="ts">
defineProps<{ title: string; search: string }>()

const emit = defineEmits<{
  'update:search': [value: string]
  add: []
  import: []
  export: []
  settings: []
  minimize: []
  close: []
}>()
</script>

<template>
  <header class="app-header">
    <div class="app-header__brand">
      <h1 class="app-header__title">{{ title }}</h1>
      <span class="app-header__subtitle">Google 2FA Desktop</span>
    </div>

    <input
      class="app-header__search"
      :value="search"
      placeholder="Search accounts"
      @input="emit('update:search', ($event.target as HTMLInputElement).value)"
    />

    <div class="app-header__actions">
      <button type="button" @click="emit('add')">Add</button>
      <button type="button" @click="emit('import')">Import</button>
      <button type="button" @click="emit('export')">Export</button>
      <button type="button" @click="emit('settings')">Settings</button>
      <button type="button" @click="emit('minimize')">_</button>
      <button type="button" @click="emit('close')">×</button>
    </div>
  </header>
</template>
