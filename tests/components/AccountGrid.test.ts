import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AccountGrid from '../../src/components/AccountGrid.vue'

describe('AccountGrid', () => {
  it('renders one card per account', () => {
    const wrapper = mount(AccountGrid, {
      props: {
        accounts: [{
          id: '1', service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, order: 0, createdAt: 1
        }],
        now: 0,
        emptyTitle: 'No accounts',
        emptyDescription: 'Add one',
        cardCopyHint: 'Click to copy',
        cardCopiedText: 'Copied',
        cardEditText: 'Edit',
        cardDeleteText: 'Delete',
        cardDeleteConfirmLabel: 'Delete',
        cardDeleteConfirmPlaceholder: 'Type delete'
      }
    })

    expect(wrapper.findAll('[data-testid="account-card"]')).toHaveLength(1)
  })
})
