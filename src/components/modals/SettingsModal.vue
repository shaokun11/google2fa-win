<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps<{
  open: boolean
  theme: 'system' | 'light' | 'dark' | 'one-dark'
  locale: 'system' | 'en' | 'zh'
  labels: {
    title: string
    themeLabel: string
    themeSystem: string
    themeLight: string
    themeDark: string
    themeOneDark: string
    languageLabel: string
    languageSystem: string
    languageEn: string
    languageZh: string
    save: string
  }
}>()

const emit = defineEmits<{
  close: []
  save: [{
    theme: 'system' | 'light' | 'dark' | 'one-dark'
    locale: 'system' | 'en' | 'zh'
  }]
}>()

const form = reactive({
  theme: props.theme,
  locale: props.locale
})

watch(
  () => [props.theme, props.locale] as const,
  ([theme, locale]) => {
    form.theme = theme
    form.locale = locale
  },
  { immediate: true }
)

const onSubmit = () => {
  emit('save', { theme: form.theme, locale: form.locale })
}
</script>

<template>
  <BaseModal :open="open" :title="labels.title" @close="emit('close')">
    <form class="form-card" @submit.prevent="onSubmit">
      <label class="form-field">
        <span class="form-field__label">{{ labels.themeLabel }}</span>
        <select name="theme" v-model="form.theme">
          <option value="system">{{ labels.themeSystem }}</option>
          <option value="light">{{ labels.themeLight }}</option>
          <option value="dark">{{ labels.themeDark }}</option>
          <option value="one-dark">{{ labels.themeOneDark }}</option>
        </select>
      </label>

      <label class="form-field">
        <span class="form-field__label">{{ labels.languageLabel }}</span>
        <select name="locale" v-model="form.locale">
          <option value="system">{{ labels.languageSystem }}</option>
          <option value="en">{{ labels.languageEn }}</option>
          <option value="zh">{{ labels.languageZh }}</option>
        </select>
      </label>

      <div class="form-card__actions">
        <BaseButton type="submit">{{ labels.save }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
