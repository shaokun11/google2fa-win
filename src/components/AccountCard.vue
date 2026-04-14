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
  deleteConfirmLabel: string
  deleteConfirmPlaceholder: string
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
const showDeleteConfirm = ref(false)
const deleteInput = ref('')
const deleteConfirmed = computed(() => deleteInput.value === '删除' || deleteInput.value === 'delete')

const copyToken = async () => {
  emit('copy', token.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}

const handleDeleteClick = () => {
  if (showDeleteConfirm.value) {
    showDeleteConfirm.value = false
    deleteInput.value = ''
  } else {
    showDeleteConfirm.value = true
  }
}

const handleDeleteConfirm = () => {
  if (!deleteConfirmed.value) return
  emit('delete', props.account.id)
  showDeleteConfirm.value = false
  deleteInput.value = ''
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteInput.value = ''
}

const stringHash = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const hue = computed(() => stringHash(props.account.secret) % 360)

const progressColor = computed(() => {
  const p = progress.value
  if (p > 60) return `hsl(142 70% 45%)`
  if (p > 30) return `hsl(${45 + ((p - 30) / 30) * 97} 85% 50%)`
  return `hsl(${(p / 30) * 20} 85% 50%)`
})

const tiltX = ref(0)
const tiltY = ref(0)
const glareX = ref(50)
const glareY = ref(50)
const glareAlpha = ref(0)
const isHovering = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  tiltX.value = ((y - centerY) / centerY) * -8
  tiltY.value = ((x - centerX) / centerX) * 8
  glareX.value = (x / rect.width) * 100
  glareY.value = (y / rect.height) * 100
  glareAlpha.value = 0.12
  isHovering.value = true
}

const handleMouseLeave = () => {
  tiltX.value = 0
  tiltY.value = 0
  glareAlpha.value = 0
  isHovering.value = false
}

const cardStyle = computed(() => {
  const accent = `hsl(${hue.value} 70% 55%)`
  return {
    borderLeft: `3px solid ${accent}`,
    '--tilt-x': `${tiltX.value}deg`,
    '--tilt-y': `${tiltY.value}deg`,
    '--glare-x': `${glareX.value}%`,
    '--glare-y': `${glareY.value}%`,
    '--glare-alpha': glareAlpha.value
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
  <article
    data-testid="account-card"
    class="account-card"
    :style="cardStyle"
    @dblclick="copyToken"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="account-card__glare" />
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
        :class="{ 'icon-button--active': showDeleteConfirm }"
        :aria-label="deleteText"
        @click="handleDeleteClick"
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
      <div class="account-card__progress" :style="{ '--bar-color': progressColor }">
        <span class="account-card__progress-bar" :style="{ width: `${progress}%` }" />
      </div>
      <span class="account-card__hint">{{ copied ? copiedText : copyHint }}</span>
    </div>

    <div v-if="showDeleteConfirm" class="account-card__delete-confirm" @click.stop>
      <input
        v-model="deleteInput"
        type="text"
        class="account-card__delete-input"
        :placeholder="deleteConfirmPlaceholder"
        autocomplete="off"
        @keyup.enter="handleDeleteConfirm"
        @keyup.escape="cancelDelete"
      />
      <button
        type="button"
        class="account-card__delete-btn"
        :disabled="!deleteConfirmed"
        @click="handleDeleteConfirm"
      >
        {{ deleteConfirmLabel }}
      </button>
    </div>
  </article>
</template>
