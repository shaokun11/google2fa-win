<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps<{
  open: boolean
  initial?: {
    service: string
    account: string
    secret: string
  }
}>()

const emit = defineEmits<{
  close: []
  submit: [{
    service: string
    account: string
    secret: string
  }]
}>()

const form = reactive({
  service: props.initial?.service ?? '',
  account: props.initial?.account ?? '',
  secret: props.initial?.secret ?? ''
})

watch(
  () => props.initial,
  (value) => {
    form.service = value?.service ?? ''
    form.account = value?.account ?? ''
    form.secret = value?.secret ?? ''
  },
  { immediate: true }
)

const onSubmit = () => {
  emit('submit', {
    service: form.service.trim(),
    account: form.account.trim(),
    secret: form.secret.trim()
  })
}
</script>

<template>
  <BaseModal :open="open" title="Add account" @close="emit('close')">
    <form class="stack" @submit.prevent="onSubmit">
      <input name="service" v-model="form.service" placeholder="Service" />
      <input name="account" v-model="form.account" placeholder="Account" />
      <input name="secret" v-model="form.secret" placeholder="Secret" />
      <BaseButton type="submit">Save</BaseButton>
    </form>
  </BaseModal>
</template>
