<script setup lang="ts">
import BaseModal from '../base/BaseModal.vue'

defineProps<{
  open: boolean
  title: string
  imageSrc: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="$emit('close')">
    <img :src="imageSrc" alt="Export QR" class="export-preview__image" />
  </BaseModal>
</template>
