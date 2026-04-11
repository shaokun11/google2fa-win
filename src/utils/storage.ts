import { ACCOUNTS_STORAGE_KEY } from '../constants/app'
import type { Account } from '../types/account'

export const loadAccounts = (): Account[] => {
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Account[]) : []
}

export const saveAccounts = (accounts: Account[]): void => {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}
