<script setup lang="ts">
import type { LayoutMode } from '../../composables/useLayoutPreference'

defineProps<{
  mode: LayoutMode
  labels: {
    grid: string
    list: string
    circular: string
  }
}>()

const emit = defineEmits<{
  change: [mode: LayoutMode]
}>()

const modes: LayoutMode[] = ['grid', 'list', 'circular']

const icons: Record<LayoutMode, string> = {
  grid: '&#9638;&#9638;&#9638;',
  list: '&#9776;',
  circular: '&#9711;'
}
</script>

<template>
  <div class="layout-switcher">
    <button
      v-for="m in modes"
      :key="m"
      type="button"
      class="layout-switcher__btn"
      :class="{ 'layout-switcher__btn--active': mode === m }"
      :title="labels[m]"
      @click="emit('change', m)"
      v-html="icons[m]"
    />
  </div>
</template>

<style scoped>
.layout-switcher {
  display: flex;
  gap: 4px;
  background: var(--button-background);
  border: 1px solid var(--button-border);
  border-radius: 8px;
  padding: 3px;
}

.layout-switcher__btn {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: background-color 150ms, color 150ms;
}

.layout-switcher__btn:hover {
  background: var(--button-border);
  color: var(--text-primary);
}

.layout-switcher__btn--active {
  background: var(--progress-color);
  color: #fff;
}

.layout-switcher__btn--active:hover {
  background: var(--progress-color);
}
</style>
