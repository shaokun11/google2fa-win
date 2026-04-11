import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AccountCard from '../../src/components/AccountCard.vue'

const account = {
  id: '1',
  service: 'Google',
  account: 'user@gmail.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  order: 0,
  createdAt: 1
}

describe('AccountCard', () => {
  it('renders service, account, and a 6 digit token', () => {
    const wrapper = mount(AccountCard, { props: { account, now: 0 } })
    expect(wrapper.text()).toContain('Google')
    expect(wrapper.text()).toContain('user@gmail.com')
    expect(wrapper.text()).toMatch(/\d{3}\s\d{3}/)
  })
})
