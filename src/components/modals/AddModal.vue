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
    <form class="form-card" @submit.prevent="onSubmit">
      <div class="form-card__intro">
        <p class="form-card__title">Add a new authenticator account</p>
        <p class="form-card__description">Enter the issuer, account label, and Base32 secret from the service you want to secure.</p>
      </div>

      <label class="form-field">
        <span class="form-field__label">Service</span>
        <input name="service" v-model="form.service" placeholder="Google, GitHub, Microsoft..." />
      </label>

      <label class="form-field">
        <span class="form-field__label">Account</span>
        <input name="account" v-model="form.account" placeholder="user@example.com" />
      </label>

      <label class="form-field">
        <span class="form-field__label">Secret key</span>
        <input name="secret" v-model="form.secret" placeholder="JBSWY3DPEHPK3PXP" />
      </label>

      <div class="form-card__actions">
        <button type="button" class="ghost-button" @click="emit('close')">Cancel</button>
        <BaseButton type="submit">Save account</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
