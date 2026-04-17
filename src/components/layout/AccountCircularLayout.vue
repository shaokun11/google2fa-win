<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
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

const currentAngle = ref(0)
let speed = 0.15
let paused = false
let animFrame = 0
let dragSourceIdx: number | null = null
let dragOverIdx: number | null = null

const ringRef = ref<HTMLElement | null>(null)
const copiedId = ref<string | null>(null)

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

const accentColor = (account: Account) => `hsl(${getHue(account.secret)} 70% 55%)`

const avatarStyle = (account: Account) => {
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

const getItemStyle = (index: number) => {
  const n = items.value.length
  if (n === 0) return {}
  const itemAngle = currentAngle.value + (index * 360 / n)
  const rad = (itemAngle - 90) * Math.PI / 180
  const radius = Math.min(200, 100 + n * 15)
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  const depthFactor = (Math.sin(rad) + 1) / 2
  const scale = 0.65 + 0.35 * depthFactor
  const opacity = 0.4 + 0.6 * depthFactor
  const zIndex = Math.round(depthFactor * 100)

  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
    zIndex,
    opacity: dragSourceIdx === index ? 0.3 : opacity
  }
}

const handleCopy = async (account: Account) => {
  const token = getToken(account)
  emit('copy', token)
  copiedId.value = account.id
  window.setTimeout(() => { copiedId.value = null }, 1200)
}

const onDragStart = (idx: number) => {
  dragSourceIdx = idx
  paused = true
}

const onDragOver = (idx: number, e: DragEvent) => {
  e.preventDefault()
  dragOverIdx = idx
}

const onDragEnd = () => {
  if (dragSourceIdx !== null && dragOverIdx !== null && dragSourceIdx !== dragOverIdx) {
    const reordered = [...items.value]
    const [moved] = reordered.splice(dragSourceIdx, 1)
    reordered.splice(dragOverIdx, 0, moved)
    items.value = reordered
    emit('reorder', reordered.map((item, index) => ({ ...item, order: index })))
  }
  dragSourceIdx = null
  dragOverIdx = null
  paused = false
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  speed += e.deltaY > 0 ? 0.05 : -0.05
  speed = Math.max(0.05, Math.min(1.0, speed))
}

const animate = () => {
  if (!paused) {
    currentAngle.value += speed
  }
  animFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  animFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})
</script>

<template>
  <section
    class="circular-layout"
    @wheel="onWheel"
    @mouseenter="paused = true"
    @mouseleave="paused = dragSourceIdx !== null"
  >
    <div class="circular-ring-glow" :style="{ width: `${Math.min(420, 220 + items.length * 25)}px`, height: `${Math.min(420, 220 + items.length * 25)}px` }" />
    <div class="circular-center-label">
      {{ items.length }}
    </div>

    <div ref="ringRef" class="circular-ring">
      <div
        v-for="(account, idx) in items"
        :key="account.id"
        class="circular-card-wrapper"
        :style="getItemStyle(idx)"
        draggable="true"
        :class="{
          'circular-card-wrapper--drag-over': dragOverIdx === idx,
          'circular-card-wrapper--drag-source': dragSourceIdx === idx
        }"
        @dragstart="onDragStart(idx)"
        @dragover="onDragOver(idx, $event)"
        @drop="onDragEnd"
        @dragend="onDragEnd"
        @dblclick="handleCopy(account)"
      >
        <div class="circular-card" :style="{ borderLeftColor: accentColor(account) }">
          <div class="circular-card__header">
            <div class="circular-card__avatar" :style="avatarStyle(account)">{{ account.service[0] }}</div>
            <div class="circular-card__meta">
              <div class="circular-card__service">{{ account.service }}</div>
              <div class="circular-card__account">{{ account.account }}</div>
            </div>
          </div>
          <button
            type="button"
            class="circular-card__token"
            :class="{ 'circular-card__token--copied': copiedId === account.id }"
            @click="handleCopy(account)"
            @dblclick.stop="handleCopy(account)"
          >
            {{ copiedId === account.id ? cardCopiedText : getDisplayToken(account) }}
          </button>
          <div class="circular-card__progress">
            <span class="circular-card__progress-bar" :style="{ width: `${getProgress(account)}%`, background: getProgressColor(account) }" />
          </div>
          <div class="circular-card__actions">
            <button type="button" class="icon-button icon-button--small" @click="$emit('edit', account)">&#9998;</button>
            <button type="button" class="icon-button icon-button--small danger" @click="$emit('delete', account.id)">&#128465;</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div v-if="accounts.length === 0" class="empty-state">
    <h2 class="empty-state__title">{{ emptyTitle }}</h2>
    <p class="empty-state__description">{{ emptyDescription }}</p>
  </div>
</template>

<style scoped>
.circular-layout {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 460px;
  margin: 0 auto;
  overflow: hidden;
}

.circular-ring-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(31, 111, 235, 0.12);
  box-shadow: 0 0 40px rgba(31, 111, 235, 0.04), inset 0 0 40px rgba(31, 111, 235, 0.02);
  pointer-events: none;
}

.circular-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-secondary);
  opacity: 0.3;
  pointer-events: none;
}

.circular-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.circular-card-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 400ms;
  cursor: grab;
}

.circular-card-wrapper--drag-source {
  z-index: 999 !important;
}

.circular-card-wrapper--drag-source .circular-card {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  transform: scale(1.1);
}

.circular-card-wrapper--drag-over .circular-card {
  border-color: var(--progress-color);
  box-shadow: 0 0 0 2px var(--progress-color), 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: scale(1.06);
}

.circular-card {
  width: 170px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid var(--button-border);
  background: var(--button-background);
  border-left: 3px solid;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  transition: border-color 200ms ease, box-shadow 300ms ease, transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.circular-card:hover {
  border-color: var(--text-secondary);
}

.circular-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.circular-card__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.circular-card__meta {
  min-width: 0;
}

.circular-card__service {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.circular-card__account {
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.circular-card__token {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
  padding: 4px 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
}

.circular-card__token--copied {
  font-size: 11px;
  letter-spacing: 0;
  color: var(--progress-color);
}

.circular-card__progress {
  height: 3px;
  border-radius: 2px;
  background: var(--button-border);
  overflow: hidden;
}

.circular-card__progress-bar {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 300ms;
}

.circular-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 150ms;
}

.circular-card:hover .circular-card__actions {
  opacity: 1;
}

.icon-button--small {
  font-size: 11px;
  padding: 2px 4px;
}
</style>
