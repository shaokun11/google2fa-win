<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  search: string
  searchPlaceholder: string
  labels: {
    add: string
    import: string
    export: string
    settings: string
  }
}>()

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
      <span class="app-header__subtitle">{{ subtitle }}</span>
    </div>

    <input
      class="app-header__search"
      :value="search"
      :placeholder="searchPlaceholder"
      @input="emit('update:search', ($event.target as HTMLInputElement).value)"
    />

    <div class="app-header__actions">
      <button type="button" @click="emit('add')">{{ labels.add }}</button>
      <button type="button" @click="emit('import')">{{ labels.import }}</button>
      <button type="button" @click="emit('export')">{{ labels.export }}</button>
      <button type="button" @click="emit('settings')">{{ labels.settings }}</button>
    </div>
  </header>
</template>
