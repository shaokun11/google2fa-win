<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '../types/account'
import { createTotpToken, getTokenProgress } from '../utils/totp'

const props = defineProps<{
  account: Account
  now: number
}>()

const token = computed(() => createTotpToken(props.account, props.now))
const displayToken = computed(() => `${token.value.slice(0, 3)} ${token.value.slice(3)}`)
const progress = computed(() => getTokenProgress(props.account.period, props.now))
</script>

<template>
  <article data-testid="account-card" class="account-card">
    <header class="account-card__header">
      <div class="account-card__avatar">{{ account.service[0] }}</div>
      <div>
        <div class="account-card__service">{{ account.service }}</div>
        <div class="account-card__account">{{ account.account }}</div>
      </div>
    </header>

    <button class="account-card__token" type="button">{{ displayToken }}</button>

    <div class="account-card__progress">
      <span class="account-card__progress-bar" :style="{ width: `${progress}%` }" />
    </div>
  </article>
</template>
