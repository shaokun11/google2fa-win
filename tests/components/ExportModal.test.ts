import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExportModal from '../../src/components/modals/ExportModal.vue'

const accounts = [{
  id: '1', service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, order: 0, createdAt: 1
}]

describe('ExportModal', () => {
  it('emits selected accounts for qr export', async () => {
    const wrapper = mount(ExportModal, { props: { open: true, accounts } })

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('button[data-format="qr"]').trigger('click')

    expect(wrapper.emitted('export-qr')?.[0]?.[0]).toHaveLength(1)
  })
})
