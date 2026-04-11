import { describe, expect, it } from 'vitest'
import { useAccounts } from '../../src/composables/useAccounts'

describe('useAccounts', () => {
  it('adds and sorts accounts by order', () => {
    const store = useAccounts()

    store.addAccount({ service: 'GitHub', account: '@user', secret: 'JBSWY3DPEHPK3PXP' })
    store.addAccount({ service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP' })

    expect(store.accounts.value.map((item) => item.service)).toEqual(['GitHub', 'Google'])
  })

  it('filters accounts by service or account text', () => {
    const store = useAccounts()
    store.addAccount({ service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP' })
    store.search.value = 'gmail'

    expect(store.filteredAccounts.value).toHaveLength(1)
  })
})
