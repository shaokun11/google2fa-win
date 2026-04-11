import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ImportModal from '../../src/components/modals/ImportModal.vue'

describe('ImportModal', () => {
  it('emits parsed manual account data', async () => {
    const wrapper = mount(ImportModal, { props: { open: true } })

    await wrapper.get('button[data-tab="manual"]').trigger('click')
    await wrapper.get('input[name="service"]').setValue('Google')
    await wrapper.get('input[name="account"]').setValue('user@gmail.com')
    await wrapper.get('input[name="secret"]').setValue('JBSWY3DPEHPK3PXP')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('import-accounts')?.[0]?.[0]).toHaveLength(1)
  })
})
