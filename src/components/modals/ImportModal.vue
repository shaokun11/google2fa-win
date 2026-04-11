<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'
import { decodeQrImage } from '../../utils/qr'
import { decodeMigrationUrl } from '../../utils/migrationProto'
import { parseOtpAuthUri } from '../../utils/otpauthUri'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'import-accounts': [Array<{
    service: string
    account: string
    secret: string
  }>]
}>()

const activeTab = ref<'qr' | 'manual' | 'file'>('qr')
const manualForm = reactive({
  service: '',
  account: '',
  secret: ''
})
const fileText = ref('')

const submitManual = () => {
  emit('import-accounts', [{
    service: manualForm.service.trim(),
    account: manualForm.account.trim(),
    secret: manualForm.secret.trim()
  }])
}

const submitText = () => {
  const accounts = fileText.value
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .map(parseOtpAuthUri)

  emit('import-accounts', accounts)
}

const importQrFile = async (file: File) => {
  const value = await decodeQrImage(file)
  emit('import-accounts', decodeMigrationUrl(value))
}
</script>

<template>
  <BaseModal :open="props.open" title="Import accounts" @close="emit('close')">
    <div class="stack">
      <div class="tab-row">
        <button type="button" data-tab="qr" @click="activeTab = 'qr'">QR</button>
        <button type="button" data-tab="manual" @click="activeTab = 'manual'">Manual</button>
        <button type="button" data-tab="file" @click="activeTab = 'file'">File</button>
      </div>

      <div v-if="activeTab === 'manual'">
        <form class="stack" @submit.prevent="submitManual">
          <input name="service" v-model="manualForm.service" placeholder="Service" />
          <input name="account" v-model="manualForm.account" placeholder="Account" />
          <input name="secret" v-model="manualForm.secret" placeholder="Secret" />
          <BaseButton type="submit">Import</BaseButton>
        </form>
      </div>

      <div v-else-if="activeTab === 'file'">
        <form class="stack" @submit.prevent="submitText">
          <textarea v-model="fileText" rows="6" placeholder="otpauth://..."></textarea>
          <BaseButton type="submit">Import</BaseButton>
        </form>
      </div>

      <div v-else class="stack">
        <input type="file" accept="image/*" @change="importQrFile(($event.target as HTMLInputElement).files?.[0] as File)" />
      </div>
    </div>
  </BaseModal>
</template>
