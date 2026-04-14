import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AccountCard from '../../src/components/AccountCard.vue'

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
  it('emits copy event with the current token on double click', async () => {
    const wrapper = mount(AccountCard, {
      props: {
        account,
        now: 0,
        copyHint: 'Click to copy',
        copiedText: 'Copied',
        editText: 'Edit',
        deleteText: 'Delete',
        deleteConfirmLabel: 'Delete',
        deleteConfirmPlaceholder: 'Type delete'
      }
    })

    await wrapper.get('.account-card__token').trigger('click')

    expect(wrapper.emitted('copy')?.[0]?.[0]).toBe('282760')
  })
})
