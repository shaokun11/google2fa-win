<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import type { Account } from '../../types/account'

const props = defineProps<{
  open: boolean
  accounts: Account[]
  labels: {
    title: string
    selectAll: string
    deleteButton: string
    confirmLabel: string
    confirmPlaceholder: string
    count: string
  }
}>()

const emit = defineEmits<{
  close: []
  'delete-confirmed': [string[]]
}>()

const selectedIds = ref<string[]>([])
const confirmInput = ref('')
const confirmed = computed(() => confirmInput.value === '删除' || confirmInput.value === 'delete')

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    selectedIds.value = []
    confirmInput.value = ''
  }
})

const allSelected = computed(() => (
  props.accounts.length > 0 && selectedIds.value.length === props.accounts.length
))

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = props.accounts.map((a) => a.id)
  }
}

const stringHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const accountHue = (service: string) => stringHash(service) % 360

const handleDelete = () => {
  if (selectedIds.value.length === 0 || !confirmed.value) return
  emit('delete-confirmed', selectedIds.value)
}
</script>

<template>
  <BaseModal :open="open" :title="labels.title" @close="emit('close')">
    <div class="stack">
      <label class="batch-del__select-all" @click.prevent="toggleAll">
        <input type="checkbox" :checked="allSelected" @change="toggleAll" />
        <span>{{ labels.selectAll }}</span>
        <span class="batch-del__count">{{ selectedIds.length }} / {{ accounts.length }}</span>
      </label>

      <div class="batch-del__cards">
        <label
          v-for="account in accounts"
          :key="account.id"
          class="batch-del__card"
          :class="{ 'batch-del__card--selected': selectedIds.includes(account.id) }"
        >
          <input type="checkbox" class="batch-del__cb" :value="account.id" v-model="selectedIds" />
          <div
            class="batch-del__avatar"
            :style="{
              background: `linear-gradient(135deg, hsl(${accountHue(account.service)} 70% 88%), hsl(${accountHue(account.service)} 60% 82%))`,
              color: `hsl(${accountHue(account.service)} 70% 40%)`
            }"
          >{{ account.service[0] }}</div>
          <div class="batch-del__meta">
            <div class="batch-del__service">{{ account.service }}</div>
            <div class="batch-del__account">{{ account.account }}</div>
          </div>
        </label>
      </div>

      <div v-if="selectedIds.length > 0" class="batch-del__confirm">
        <span class="batch-del__confirm-label">{{ labels.confirmLabel }}</span>
        <input
          v-model="confirmInput"
          type="text"
          class="batch-del__confirm-input"
          :placeholder="labels.confirmPlaceholder"
          autocomplete="off"
          @keyup.enter="handleDelete"
        />
      </div>

      <button
        type="button"
        class="base-button batch-del__btn"
        :disabled="selectedIds.length === 0 || !confirmed"
        @click="handleDelete"
      >
        {{ labels.deleteButton }} ({{ selectedIds.length }})
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.batch-del__select-all {
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

.batch-del__select-all input { margin: 0; }

.batch-del__count {
  font-size: 12px;
  color: var(--text-secondary);
}

.batch-del__cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}

.batch-del__cards::-webkit-scrollbar { width: 6px; }
.batch-del__cards::-webkit-scrollbar-thumb { background: var(--button-border); border-radius: 3px; }

.batch-del__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--button-border);
  background: var(--button-background);
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms;
}

.batch-del__card--selected {
  border-color: var(--danger, #e06c75);
  background: color-mix(in srgb, var(--danger, #e06c75) 8%, var(--button-background) 92%);
}

.batch-del__cb {
  width: 16px;
  height: 16px;
  accent-color: var(--danger, #e06c75);
  cursor: pointer;
  flex-shrink: 0;
}

.batch-del__avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.batch-del__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.batch-del__service {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.batch-del__account {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.batch-del__confirm {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--button-border);
}

.batch-del__confirm-label {
  font-size: 12px;
  white-space: nowrap;
  color: var(--text-secondary);
}

.batch-del__confirm-input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--button-border);
  background: var(--button-background);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  min-width: 0;
}

.batch-del__confirm-input:focus {
  border-color: var(--danger, #e06c75);
}

.batch-del__btn {
  width: 100%;
  justify-content: center;
  background: var(--danger, #e06c75);
  color: #fff;
  border-color: transparent;
}

.batch-del__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
