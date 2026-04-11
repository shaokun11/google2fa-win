import { describe, expect, it } from 'vitest'
import { loadAccounts, saveAccounts } from '../../src/utils/storage'

const account = {
  id: '1',
  service: 'Google',
  account: 'user@gmail.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1' as const,
  digits: 6 as const,
  period: 30,
  order: 0,
  createdAt: 1
}

describe('storage utils', () => {
  it('round-trips accounts through localStorage', () => {
    saveAccounts([account])
    expect(loadAccounts()).toEqual([account])
  })

  it('returns empty array when storage is empty', () => {
    localStorage.clear()
    expect(loadAccounts()).toEqual([])
  })
})
