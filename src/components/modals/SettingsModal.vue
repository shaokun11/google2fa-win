<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps<{
  open: boolean
  theme: 'system' | 'light' | 'dark'
  locale: 'system' | 'en' | 'zh'
}>()

const emit = defineEmits<{
  close: []
  save: [{
    theme: 'system' | 'light' | 'dark'
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
  <BaseModal :open="open" title="Settings" @close="emit('close')">
    <form class="stack" @submit.prevent="onSubmit">
      <label>
        Theme
        <select name="theme" v-model="form.theme">
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>

      <label>
        Language
        <select name="locale" v-model="form.locale">
          <option value="system">System</option>
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </label>

      <BaseButton type="submit">Save</BaseButton>
    </form>
  </BaseModal>
</template>
