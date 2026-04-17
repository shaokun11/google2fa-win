<script setup lang="ts">
import type { Account } from '../types/account'
import AccountGridLayout from './layout/AccountGridLayout.vue'
import AccountListLayout from './layout/AccountListLayout.vue'
import AccountCircularLayout from './layout/AccountCircularLayout.vue'
import type { LayoutMode } from '../composables/useLayoutPreference'

defineProps<{
  mode: LayoutMode
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
  reorder: [accounts: Account[]]
}>()
</script>

<template>
  <AccountGridLayout
    v-if="mode === 'grid'"
    :accounts="accounts"
    :now="now"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :card-copy-hint="cardCopyHint"
    :card-copied-text="cardCopiedText"
    :card-edit-text="cardEditText"
    :card-delete-text="cardDeleteText"
    :card-delete-confirm-label="cardDeleteConfirmLabel"
    :card-delete-confirm-placeholder="cardDeleteConfirmPlaceholder"
    @copy="$emit('copy', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @reorder="$emit('reorder', $event)"
  />
  <AccountListLayout
    v-else-if="mode === 'list'"
    :accounts="accounts"
    :now="now"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :card-copy-hint="cardCopyHint"
    :card-copied-text="cardCopiedText"
    :card-edit-text="cardEditText"
    :card-delete-text="cardDeleteText"
    :card-delete-confirm-label="cardDeleteConfirmLabel"
    :card-delete-confirm-placeholder="cardDeleteConfirmPlaceholder"
    @copy="$emit('copy', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @reorder="$emit('reorder', $event)"
  />
  <AccountCircularLayout
    v-else
    :accounts="accounts"
    :now="now"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :card-copy-hint="cardCopyHint"
    :card-copied-text="cardCopiedText"
    :card-edit-text="cardEditText"
    :card-delete-text="cardDeleteText"
    :card-delete-confirm-label="cardDeleteConfirmLabel"
    :card-delete-confirm-placeholder="cardDeleteConfirmPlaceholder"
    @copy="$emit('copy', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @reorder="$emit('reorder', $event)"
  />
</template>
