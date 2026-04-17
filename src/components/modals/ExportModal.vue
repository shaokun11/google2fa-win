<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'
import type { Account } from '../../types/account'

const props = defineProps<{
  open: boolean
  accounts: Account[]
  labels: {
    title: string
    selectAll: string
    exportQr: string
    exportText: string
    exportFile: string
    copied: string
    saved: string
  }
}>()

const emit = defineEmits<{
  close: []
  'export-qr': [Account[]]
  'export-text': [Account[]]
  'export-file': [Account[]]
}>()

const selectedIds = ref<string[]>([])
const showCopied = ref(false)
const showSaved = ref(false)

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    selectedIds.value = []
    showCopied.value = false
    showSaved.value = false
  }
})

const allSelected = computed(() => (
  props.accounts.length > 0 && selectedIds.value.length === props.accounts.length
))

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = props.accounts.map((item) => item.id)
  }
}

const selectedAccounts = computed(() => (
  props.accounts.filter((item) => selectedIds.value.includes(item.id))
))

const stringHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const accountHue = (service: string) => stringHash(service) % 360

const handleExportText = () => {
  if (selectedAccounts.value.length === 0) return
  emit('export-text', selectedAccounts.value)
  showCopied.value = true
  window.setTimeout(() => {
    showCopied.value = false
  }, 2000)
}

const handleExportQr = () => {
  if (selectedAccounts.value.length === 0) return
  emit('export-qr', selectedAccounts.value)
}

const handleExportFile = () => {
  if (selectedAccounts.value.length === 0) return
  emit('export-file', selectedAccounts.value)
  showSaved.value = true
  window.setTimeout(() => {
    showSaved.value = false
  }, 2000)
}
</script>

<template>
  <BaseModal :open="open" :title="labels.title" @close="emit('close')">
    <div class="stack">
      <div class="export-header">
        <label class="export-select-all" @click.prevent="toggleAll">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleAll"
          />
          <span class="export-select-all__text">{{ labels.selectAll }}</span>
          <span class="export-select-all__count">
            {{ selectedIds.length }} / {{ accounts.length }}
          </span>
        </label>
      </div>

      <div class="export-cards">
        <label
          v-for="account in accounts"
          :key="account.id"
          class="export-card"
          :class="{ 'export-card--selected': selectedIds.includes(account.id) }"
        >
          <input
            type="checkbox"
            class="export-card__checkbox"
            :value="account.id"
            v-model="selectedIds"
          />
          <div
            class="export-card__avatar"
            :style="{
              background: `linear-gradient(135deg, hsl(${accountHue(account.service)} 70% 88%), hsl(${accountHue(account.service)} 60% 82%))`,
              color: `hsl(${accountHue(account.service)} 70% 40%)`
            }"
          >
            {{ account.service[0] }}
          </div>
          <div class="export-card__meta">
            <div class="export-card__service">{{ account.service }}</div>
            <div class="export-card__account">{{ account.account }}</div>
          </div>
        </label>
      </div>

      <div class="export-actions">
        <button
          type="button"
          class="export-actions__btn base-button"
          data-format="qr"
          :disabled="selectedAccounts.length === 0"
          @click="handleExportQr"
        >
          {{ labels.exportQr }}
        </button>
        <button
          type="button"
          class="export-actions__btn base-button"
          data-format="text"
          :disabled="selectedAccounts.length === 0"
          @click="handleExportText"
        >
          {{ showCopied ? labels.copied : labels.exportText }}
        </button>
        <button
          type="button"
          class="export-actions__btn base-button"
          data-format="file"
          :disabled="selectedAccounts.length === 0"
          @click="handleExportFile"
        >
          {{ showSaved ? labels.saved : labels.exportFile }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.export-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.export-select-all {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--button-border);
  background: var(--button-background);
  width: 100%;
}

.export-select-all input {
  margin: 0;
}

.export-select-all__text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.export-select-all__count {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.export-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.export-cards::-webkit-scrollbar {
  width: 6px;
}

.export-cards::-webkit-scrollbar-track {
  background: transparent;
}

.export-cards::-webkit-scrollbar-thumb {
  background: var(--button-border);
  border-radius: 3px;
}

.export-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--button-border);
  background: var(--button-background);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}

.export-card:hover {
  background: color-mix(in srgb, var(--button-background) 96%, var(--text-primary) 4%);
}

.export-card--selected {
  border-color: var(--progress-color);
  background: color-mix(in srgb, var(--progress-color) 8%, var(--button-background) 92%);
  box-shadow: 0 0 0 1px var(--progress-color);
}

.export-card__checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--progress-color);
  cursor: pointer;
  flex-shrink: 0;
}

.export-card__avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.export-card__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.export-card__service {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.export-card__account {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.export-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
}

.export-actions__btn {
  width: 100%;
  justify-content: center;
}

.export-actions__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
