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

const cardStyle = computed(() => {
  const h = hue.value
  const theme = document.documentElement.dataset.theme as 'light' | 'dark' | 'one-dark' | undefined
  const isDark = theme === 'dark' || theme === 'one-dark'

  if (isDark) {
    return {
      background: `linear-gradient(135deg, hsl(${h} 40% 18%), hsl(${h} 30% 14%))`,
      borderColor: `hsl(${h} 30% 25%)`
    }
  }

  return {
    background: `linear-gradient(135deg, hsl(${h} 70% 94%), hsl(${h} 60% 88%))`,
    borderColor: `hsl(${h} 50% 85%)`
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

// Particle burst + heart converge effect
const burstActive = ref(false)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  alpha: number
  targetX: number
  targetY: number
}

const triggerBurst = (e: MouseEvent) => {
  const card = (e.currentTarget as HTMLElement)
  const rect = card.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const w = rect.width
  const h = rect.height
  const hsl = hue.value

  burstActive.value = true
  const count = 40
  const particles: Particle[] = []

  // Heart shape target points (parametric)
  const heartPoints: Array<{ x: number; y: number }> = []
  const heartCx = w / 2
  const heartCy = h / 2 - 10
  const heartScale = Math.min(w, h) * 0.022
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    const hx = 16 * Math.pow(Math.sin(t), 3)
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    heartPoints.push({
      x: heartCx + hx * heartScale,
      y: heartCy + hy * heartScale
    })
  }

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const speed = 60 + Math.random() * 100
    const target = heartPoints[i]
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 3,
      hue: hsl + Math.floor(Math.random() * 60 - 30),
      alpha: 1,
      targetX: target.x,
      targetY: target.y
    })
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;border-radius:16px;'
  card.appendChild(canvas)
  const ctx = canvas.getContext('2d')!

  const duration = 1200
  const explodePhase = 400
  const start = performance.now()

  const animate = (now: number) => {
    const elapsed = now - start
    ctx.clearRect(0, 0, w, h)

    if (elapsed > duration) {
      canvas.remove()
      burstActive.value = false
      return
    }

    const t = Math.min(elapsed / duration, 1)

    for (const p of particles) {
      if (t < explodePhase / duration) {
        // Phase 1: explode outward
        const et = elapsed / 1000
        p.x += p.vx * (1 / 60)
        p.y += p.vy * (1 / 60)
        p.alpha = 1
      } else {
        // Phase 2: converge to heart
        const ct = (t - explodePhase / duration) / (1 - explodePhase / duration)
        const ease = ct * ct * (3 - 2 * ct) // smoothstep
        const curX = p.x + (p.targetX - p.x) * 0.08
        const curY = p.y + (p.targetY - p.y) * 0.08
        p.x = curX
        p.y = curY
        p.alpha = 1 - ct * 0.3
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (burstActive.value ? 1 : 0.5), 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue} 80% 65% ${p.alpha})`
      ctx.shadowColor = `hsla(${p.hue} 80% 65% 0.6)`
      ctx.shadowBlur = 6
      ctx.fill()
    }

    ctx.shadowBlur = 0
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

const handleDblClick = (e: MouseEvent) => {
  copyToken()
  triggerBurst(e)
}
</script>

<template>
  <article data-testid="account-card" class="account-card" :style="cardStyle" @dblclick="handleDblClick">
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
      <div class="account-card__progress">
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
