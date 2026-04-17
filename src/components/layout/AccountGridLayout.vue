<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Account } from '../../types/account'
import AccountCard from '../AccountCard.vue'

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
</script>

<template>
  <draggable
    :list="items"
    item-key="id"
    class="account-grid"
    ghost-class="grid-ghost"
    drag-class="grid-drag"
    :animation="200"
    @end="onDragEnd"
  >
    <template #item="{ element: account }">
      <AccountCard
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
    </template>
  </draggable>

  <div v-if="accounts.length === 0" class="empty-state">
    <h2 class="empty-state__title">{{ emptyTitle }}</h2>
    <p class="empty-state__description">{{ emptyDescription }}</p>
  </div>
</template>
