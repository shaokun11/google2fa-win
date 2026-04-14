import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ImportModal from '../../src/components/modals/ImportModal.vue'

const labels = {
  title: 'Import accounts',
  tabQr: 'QR Image',
  tabFile: 'Text file',
  manualImport: 'Import',
  filePlaceholder: 'Paste URIs',
  qrHint: 'Choose a QR image',
  qrButton: 'Choose image'
}

describe('ImportModal', () => {
  it('renders QR and file tabs', () => {
    const wrapper = mount(ImportModal, { props: { open: true, labels } })
    expect(wrapper.text()).toContain('QR Image')
    expect(wrapper.text()).toContain('Text file')
  })
})
