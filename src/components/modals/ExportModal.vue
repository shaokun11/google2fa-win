<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'
import type { Account } from '../../types/account'

const props = defineProps<{
  open: boolean
  accounts: Account[]
}>()

const emit = defineEmits<{
  close: []
  'export-qr': [Account[]]
  'export-text': [Account[]]
}>()

const selectedIds = ref<string[]>([])

const selectedAccounts = computed(() => (
  props.accounts.filter((item) => selectedIds.value.includes(item.id))
))
</script>

<template>
  <BaseModal :open="open" title="Export accounts" @close="emit('close')">
    <div class="stack">
      <label v-for="account in accounts" :key="account.id">
        <input type="checkbox" :value="account.id" v-model="selectedIds" />
        {{ account.service }} — {{ account.account }}
      </label>

      <div class="stack stack--row">
        <BaseButton data-format="qr" @click="emit('export-qr', selectedAccounts)">Export QR</BaseButton>
        <BaseButton data-format="text" @click="emit('export-text', selectedAccounts)">Export Text</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
