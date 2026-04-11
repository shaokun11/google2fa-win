import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AccountCard from '../../src/components/AccountCard.vue'

const writeText = vi.fn()
Object.assign(navigator, {
  clipboard: {
    writeText
  }
})

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

describe('AccountCard interactions', () => {
  it('copies the current token on double click', async () => {
    const wrapper = mount(AccountCard, { props: { account, now: 0 } })

    await wrapper.get('[data-testid="account-card"]').trigger('dblclick')

    expect(writeText).toHaveBeenCalledWith('282760')
  })
})
