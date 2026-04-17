<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Account } from '../../types/account'
import { createTotpToken, getTokenProgress } from '../../utils/totp'

const props = defineProps<{
  accounts: Account[]
  now: number
  emptyTitle: string
  emptyDescription: string
  cardCopyHint: string
  cardCopiedText: string
  cardEditText: string
  cardDeleteText: string
  cardDeleteConfirmLabel: string
  cardDeleteConfirmPlaceholder: string
}>()

const emit = defineEmits<{
  copy: [token: string]
  edit: [account: Account]
  delete: [id: string]
  reorder: [accounts: Account[]]
}>()

const items = ref<Account[]>([...props.accounts])

watch(() => props.accounts, (updated) => {
  items.value = [...updated]
})

const onDragEnd = () => {
  const reordered = items.value.map((item, index) => ({ ...item, order: index }))
  emit('reorder', reordered)
}

const stringHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const getHue = (secret: string) => stringHash(secret) % 360

const getToken = (account: Account) => createTotpToken(account, props.now)
const getDisplayToken = (account: Account) => {
  const token = getToken(account)
  return `${token.slice(0, 3)} ${token.slice(3)}`
}

const getProgress = (account: Account) => getTokenProgress(account.period, props.now)

const getProgressColor = (account: Account) => {
  const p = getProgress(account)
  if (p > 60) return 'hsl(142 70% 45%)'
  if (p > 30) return `hsl(${45 + ((p - 30) / 30) * 97} 85% 50%)`
  return `hsl(${(p / 30) * 20} 85% 50%)`
}

const avatarStyle = computed(() => {
  return (account: Account) => {
    const h = getHue(account.secret)
    const theme = document.documentElement.dataset.theme as 'light' | 'dark' | 'one-dark' | undefined
    const isDark = theme === 'dark' || theme === 'one-dark'
    if (isDark) {
      return {
        background: `linear-gradient(135deg, hsl(${h} 60% 22%), hsl(${h} 50% 16%))`,
        color: `hsl(${h} 80% 72%)`
      }
    }
    return {
      background: `linear-gradient(135deg, hsl(${h} 80% 94%), hsl(${h} 70% 90%))`,
      color: `hsl(${h} 70% 45%)`
    }
  }
})

const accentColor = (account: Account) => `hsl(${getHue(account.secret)} 70% 55%)`

const copiedId = ref<string | null>(null)

const handleCopy = async (account: Account) => {
  const token = getToken(account)
  emit('copy', token)
  copiedId.value = account.id
  window.setTimeout(() => { copiedId.value = null }, 1200)
}
</script>

<template>
  <draggable
    :list="items"
    item-key="id"
    class="account-list"
    ghost-class="list-ghost"
    drag-class="list-drag"
    :animation="200"
    @end="onDragEnd"
  >
    <template #item="{ element: account }">
      <div
        class="list-card"
        :style="{ borderLeftColor: accentColor(account) }"
        @dblclick="handleCopy(account)"
      >
        <div class="list-card__avatar" :style="avatarStyle(account)">{{ account.service[0] }}</div>
        <div class="list-card__meta">
          <div class="list-card__service">{{ account.service }}</div>
          <div class="list-card__account">{{ account.account }}</div>
        </div>
        <button
          type="button"
          class="list-card__token"
          :class="{ 'list-card__token--copied': copiedId === account.id }"
          @click="handleCopy(account)"
          @dblclick.stop="handleCopy(account)"
        >
          {{ copiedId === account.id ? cardCopiedText : getDisplayToken(account) }}
        </button>
        <div class="list-card__progress">
          <span class="list-card__progress-bar" :style="{ width: `${getProgress(account)}%`, background: getProgressColor(account) }" />
        </div>
        <div class="list-card__actions">
          <button type="button" class="icon-button" @click="$emit('edit', account)">&#9998;</button>
          <button type="button" class="icon-button danger" @click="$emit('delete', account.id)">&#128465;</button>
        </div>
      </div>
    </template>
  </draggable>

  <div v-if="accounts.length === 0" class="empty-state">
    <h2 class="empty-state__title">{{ emptyTitle }}</h2>
    <p class="empty-state__description">{{ emptyDescription }}</p>
  </div>
</template>

<style scoped>
.account-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.list-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--button-border);
  background: var(--button-background);
  border-left: 3px solid;
  cursor: grab;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.list-card:hover {
  background: color-mix(in srgb, var(--button-background) 96%, var(--text-primary) 4%);
}

.list-ghost {
  opacity: 0;
}

.list-drag {
  opacity: 0.9;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
  z-index: 9999;
}

.list-card.sortable-chosen {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: color-mix(in srgb, var(--progress-color) 6%, var(--button-background) 94%);
  z-index: 10;
}

.list-card__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.list-card__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-card__service {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card__account {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card__token {
  margin-left: auto;
  min-width: 100px;
  text-align: right;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 3px;
  font-variant-numeric: tabular-nums;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
}

.list-card__token--copied {
  font-size: 12px;
  letter-spacing: 0;
  color: var(--progress-color);
}

.list-card__progress {
  width: 60px;
  height: 3px;
  border-radius: 2px;
  background: var(--button-border);
  overflow: hidden;
  flex-shrink: 0;
}

.list-card__progress-bar {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 300ms;
}

.list-card__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 150ms;
}

.list-card:hover .list-card__actions {
  opacity: 1;
}
</style>
