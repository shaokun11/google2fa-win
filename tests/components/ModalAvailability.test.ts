import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ImportModal from '../../src/components/modals/ImportModal.vue'
import ExportModal from '../../src/components/modals/ExportModal.vue'
import SettingsModal from '../../src/components/modals/SettingsModal.vue'

describe('Modal availability', () => {
  it('renders import modal actions', () => {
    const wrapper = mount(ImportModal, { props: { open: true } })
    expect(wrapper.text()).toContain('Import accounts')
    expect(wrapper.text()).toContain('Manual')
    expect(wrapper.text()).toContain('File')
  })

  it('renders export modal actions', () => {
    const wrapper = mount(ExportModal, {
      props: {
        open: true,
        accounts: [{
          id: '1', service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, order: 0, createdAt: 1
        }]
      }
    })
    expect(wrapper.text()).toContain('Export QR')
    expect(wrapper.text()).toContain('Export Text')
  })

  it('renders settings modal actions', () => {
    const wrapper = mount(SettingsModal, { props: { open: true, theme: 'system', locale: 'system' } })
    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.text()).toContain('Theme')
    expect(wrapper.text()).toContain('Language')
  })
})
