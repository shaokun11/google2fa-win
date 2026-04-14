<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'
import { decodeQrImage } from '../../utils/qr'
import { decodeMigrationUrl } from '../../utils/migrationProto'
import { parseOtpAuthUri } from '../../utils/otpauthUri'

const props = defineProps<{
  open: boolean
  labels: {
    title: string
    tabQr: string
    tabFile: string
    manualImport: string
    filePlaceholder: string
    qrHint: string
    qrButton: string
  }
}>()

const emit = defineEmits<{
  close: []
  'import-accounts': [Array<{
    service: string
    account: string
    secret: string
  }>]
}>()

const activeTab = ref<'qr' | 'file'>('qr')
const fileText = ref('')
const qrFileName = ref('')

const submitText = () => {
  const text = fileText.value.trim()
  if (!text) return

  // Handle otpauth-migration:// URLs
  if (text.startsWith('otpauth-migration://')) {
    try {
      const accounts = decodeMigrationUrl(text)
      emit('import-accounts', accounts)
      fileText.value = ''
      return
    } catch {
      return
    }
  }

  // Handle otpauth:// URIs (one per line)
  const accounts = text
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .map(parseOtpAuthUri)

  emit('import-accounts', accounts)
  fileText.value = ''
}

const importQrFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  qrFileName.value = file.name
  const value = await decodeQrImage(file)
  emit('import-accounts', decodeMigrationUrl(value))
  qrFileName.value = ''
  input.value = ''
}
</script>

<template>
  <BaseModal :open="props.open" :title="labels.title" @close="emit('close')">
    <div class="stack">
      <div class="tab-row">
        <button
          type="button"
          data-tab="qr"
          :class="{ active: activeTab === 'qr' }"
          @click="activeTab = 'qr'"
        >
          {{ labels.tabQr }}
        </button>
        <button
          type="button"
          data-tab="file"
          :class="{ active: activeTab === 'file' }"
          @click="activeTab = 'file'"
        >
          {{ labels.tabFile }}
        </button>
      </div>

      <div v-if="activeTab === 'file'">
        <form class="stack" @submit.prevent="submitText">
          <textarea
            v-model="fileText"
            rows="8"
            :placeholder="labels.filePlaceholder"
          />
          <BaseButton type="submit">{{ labels.manualImport }}</BaseButton>
        </form>
      </div>

      <div v-else class="stack">
        <p class="form-card__description">{{ labels.qrHint }}</p>
        <label class="file-upload">
          <input
            type="file"
            accept="image/*"
            class="file-upload__input"
            @change="importQrFile"
          />
          <span class="file-upload__button">{{ labels.qrButton }}</span>
          <span v-if="qrFileName" class="file-upload__name">{{ qrFileName }}</span>
        </label>
      </div>
    </div>
  </BaseModal>
</template>
