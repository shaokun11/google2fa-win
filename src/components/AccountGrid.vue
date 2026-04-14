<script setup lang="ts">
import type { Account } from '../types/account'
import AccountCard from './AccountCard.vue'

defineProps<{
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

defineEmits<{
  copy: [token: string]
  edit: [account: Account]
  delete: [id: string]
}>()
</script>

<template>
  <section class="account-grid">
    <AccountCard
      v-for="account in accounts"
      :key="account.id"
      :account="account"
      :now="now"
      :copy-hint="cardCopyHint"
      :copied-text="cardCopiedText"
      :edit-text="cardEditText"
      :delete-text="cardDeleteText"
      :delete-confirm-label="cardDeleteConfirmLabel"
      :delete-confirm-placeholder="cardDeleteConfirmPlaceholder"
      @copy="$emit('copy', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />

    <div v-if="accounts.length === 0" class="empty-state">
      <h2 class="empty-state__title">{{ emptyTitle }}</h2>
      <p class="empty-state__description">{{ emptyDescription }}</p>
    </div>
  </section>
</template>
