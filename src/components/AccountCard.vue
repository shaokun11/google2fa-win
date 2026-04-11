<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Account } from '../types/account'
import { createTotpToken, getTokenProgress } from '../utils/totp'

const props = defineProps<{
  account: Account
  now: number
}>()

const token = computed(() => createTotpToken(props.account, props.now))
const displayToken = computed(() => `${token.value.slice(0, 3)} ${token.value.slice(3)}`)
const progress = computed(() => getTokenProgress(props.account.period, props.now))
const copied = ref(false)

const copyToken = async () => {
  if (window.electron?.copyText) {
    await window.electron.copyText(token.value)
  } else {
    await navigator.clipboard.writeText(token.value)
  }

  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}
</script>

<template>
  <article data-testid="account-card" class="account-card" @dblclick="copyToken">
    <header class="account-card__header">
      <div class="account-card__avatar">{{ account.service[0] }}</div>
      <div>
        <div class="account-card__service">{{ account.service }}</div>
        <div class="account-card__account">{{ account.account }}</div>
      </div>
    </header>

    <button class="account-card__token" type="button" @click="copyToken" @dblclick.stop="copyToken">{{ displayToken }}</button>

    <div class="account-card__footer">
      <div class="account-card__progress">
        <span class="account-card__progress-bar" :style="{ width: `${progress}%` }" />
      </div>
      <span class="account-card__hint">{{ copied ? 'Copied' : 'Click or double click to copy' }}</span>
    </div>
  </article>
</template>
