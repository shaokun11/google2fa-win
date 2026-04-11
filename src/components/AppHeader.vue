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

    <input
      class="app-header__search"
      :value="search"
      @input="emit('update:search', ($event.target as HTMLInputElement).value)"
    />

    <div class="app-header__actions">
      <button type="button" @click="emit('add')">Add</button>
      <button type="button" @click="emit('import')">Import</button>
      <button type="button" @click="emit('export')">Export</button>
      <button type="button" @click="emit('settings')">Settings</button>
    </div>
  </header>
</template>
