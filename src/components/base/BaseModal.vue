<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="props.open" class="base-modal__backdrop" @click.self="emit('close')">
    <section class="base-modal" role="dialog" aria-modal="true">
      <header class="base-modal__header">
        <h2 class="base-modal__title">{{ props.title }}</h2>
        <button type="button" class="base-modal__close" aria-label="Close" @click="emit('close')">
          ×
        </button>
      </header>
      <div class="base-modal__content">
        <slot />
      </div>
    </section>
  </div>
</template>
