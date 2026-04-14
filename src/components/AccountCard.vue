<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Account } from '../types/account'
import { createTotpToken, getTokenProgress } from '../utils/totp'

const props = defineProps<{
  account: Account
  now: number
  copyHint: string
  copiedText: string
  editText: string
  deleteText: string
}>()

const emit = defineEmits<{
  copy: [token: string]
  edit: [account: Account]
  delete: [id: string]
}>()

const token = computed(() => createTotpToken(props.account, props.now))
const displayToken = computed(() => `${token.value.slice(0, 3)} ${token.value.slice(3)}`)
const progress = computed(() => getTokenProgress(props.account.period, props.now))
const copied = ref(false)

const copyToken = async () => {
  emit('copy', token.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}

const stringHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const hue = computed(() => stringHash(props.account.service) % 360)

const cardStyle = computed(() => {
  const accent = `hsl(${hue.value} 70% 55%)`
  return {
    borderLeft: `3px solid ${accent}`
  }
})

const avatarStyle = computed(() => {
  const theme = document.documentElement.dataset.theme as 'light' | 'dark' | 'one-dark' | undefined
  const isDark = theme === 'dark' || theme === 'one-dark'
  const h = hue.value

  if (isDark) {
    const bg = `linear-gradient(135deg, hsl(${h} 60% 22%), hsl(${h} 50% 16%))`
    const color = `hsl(${h} 80% 72%)`
    return { background: bg, color }
  }

  const bg = `linear-gradient(135deg, hsl(${h} 80% 94%), hsl(${h} 70% 90%))`
  const color = `hsl(${h} 70% 45%)`
  return { background: bg, color }
})
</script>

<template>
  <article data-testid="account-card" class="account-card" :style="cardStyle">
    <div class="account-card__actions">
      <button
        type="button"
        class="icon-button"
        :aria-label="editText"
        @click="emit('edit', account)"
      >
        ✎
      </button>
      <button
        type="button"
        class="icon-button danger"
        :aria-label="deleteText"
        @click="emit('delete', account.id)"
      >
        🗑
      </button>
    </div>

    <header class="account-card__header">
      <div class="account-card__avatar" :style="avatarStyle">{{ account.service[0] }}</div>
      <div class="account-card__meta">
        <div class="account-card__service">{{ account.service }}</div>
        <div class="account-card__account">{{ account.account }}</div>
      </div>
    </header>

    <button
      class="account-card__token"
      :class="{ 'account-card__token--copied': copied }"
      type="button"
      @click="copyToken"
      @dblclick.stop="copyToken"
    >
      {{ displayToken }}
    </button>

    <div class="account-card__footer">
      <div class="account-card__progress">
        <span class="account-card__progress-bar" :style="{ width: `${progress}%` }" />
      </div>
      <span class="account-card__hint">{{ copied ? copiedText : copyHint }}</span>
    </div>
  </article>
</template>
