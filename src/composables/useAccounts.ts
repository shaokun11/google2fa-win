import { computed, ref } from 'vue'
import { loadAccounts, saveAccounts } from '../utils/storage'
import type { Account } from '../types/account'

export const useAccounts = () => {
  const accounts = ref<Account[]>(loadAccounts())
  const search = ref('')

  const persist = () => saveAccounts(accounts.value)

  const addAccount = (input: Pick<Account, 'service' | 'account' | 'secret'>) => {
    const next: Account = {
      id: crypto.randomUUID(),
      service: input.service,
      account: input.account,
      secret: input.secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      order: accounts.value.length,
      createdAt: Date.now()
    }

    accounts.value = [...accounts.value, next]
    persist()
  }

  const updateAccount = (id: string, patch: Pick<Account, 'service' | 'account' | 'secret'>) => {
    accounts.value = accounts.value.map((item) => (
      item.id === id
        ? { ...item, ...patch }
        : item
    ))
    persist()
  }

  const removeAccount = (id: string) => {
    accounts.value = accounts.value
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, order: index }))
    persist()
  }

  const filteredAccounts = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) {
      return [...accounts.value].sort((a, b) => a.order - b.order)
    }

    return accounts.value
      .filter((item) => `${item.service} ${item.account}`.toLowerCase().includes(query))
      .sort((a, b) => a.order - b.order)
  })

  return {
    accounts,
    search,
    filteredAccounts,
    addAccount,
    updateAccount,
    removeAccount
  }
}
