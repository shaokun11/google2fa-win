<script setup lang="ts">
import type { Account } from '../types/account'
import AccountCard from './AccountCard.vue'

defineProps<{
  accounts: Account[]
  now: number
}>()
</script>

<template>
  <section class="account-grid">
    <AccountCard
      v-for="account in accounts"
      :key="account.id"
      :account="account"
      :now="now"
    />
  </section>
</template>
