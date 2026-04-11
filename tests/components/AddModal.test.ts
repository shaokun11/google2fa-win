import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AddModal from '../../src/components/modals/AddModal.vue'

describe('AddModal', () => {
  it('emits submit payload for a valid manual account', async () => {
    const wrapper = mount(AddModal, { props: { open: true } })

    await wrapper.get('input[name="service"]').setValue('Google')
    await wrapper.get('input[name="account"]').setValue('user@gmail.com')
    await wrapper.get('input[name="secret"]').setValue('JBSWY3DPEHPK3PXP')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ service: 'Google', account: 'user@gmail.com' })
  })
})
