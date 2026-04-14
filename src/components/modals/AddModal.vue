<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps<{
  open: boolean
  mode: 'add' | 'edit'
  initial?: {
    service: string
    account: string
    secret: string
  }
  labels: {
    titleAdd: string
    titleEdit: string
    descriptionAdd: string
    descriptionEdit: string
    serviceLabel: string
    servicePlaceholder: string
    accountLabel: string
    accountPlaceholder: string
    secretLabel: string
    secretPlaceholder: string
    cancel: string
    saveAccount: string
    saveChanges: string
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
  service: '',
  account: '',
  secret: ''
})

const resetForm = () => {
  form.service = props.initial?.service ?? ''
  form.account = props.initial?.account ?? ''
  form.secret = props.initial?.secret ?? ''
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

const title = () => props.mode === 'add' ? props.labels.titleAdd : props.labels.titleEdit
const description = () => props.mode === 'add' ? props.labels.descriptionAdd : props.labels.descriptionEdit
const submitLabel = () => props.mode === 'add' ? props.labels.saveAccount : props.labels.saveChanges

const onSubmit = () => {
  emit('submit', {
    service: form.service.trim(),
    account: form.account.trim(),
    secret: form.secret.trim()
  })
}
</script>

<template>
  <BaseModal :open="open" :title="title()" @close="emit('close')">
    <form class="form-card" @submit.prevent="onSubmit">
      <div class="form-card__intro">
        <p class="form-card__description">{{ description() }}</p>
      </div>

      <label class="form-field">
        <span class="form-field__label">{{ labels.serviceLabel }}</span>
        <input
          name="service"
          v-model="form.service"
          :placeholder="labels.servicePlaceholder"
          autocomplete="off"
        />
      </label>

      <label class="form-field">
        <span class="form-field__label">{{ labels.accountLabel }}</span>
        <input
          name="account"
          v-model="form.account"
          :placeholder="labels.accountPlaceholder"
          autocomplete="off"
        />
      </label>

      <label class="form-field">
        <span class="form-field__label">{{ labels.secretLabel }}</span>
        <input
          name="secret"
          v-model="form.secret"
          :placeholder="labels.secretPlaceholder"
          autocomplete="off"
        />
      </label>

      <div class="form-card__actions">
        <button type="button" class="ghost-button" @click="emit('close')">
          {{ labels.cancel }}
        </button>
        <BaseButton type="submit">{{ submitLabel() }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
