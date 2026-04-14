import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ImportModal from '../../src/components/modals/ImportModal.vue'
import ExportModal from '../../src/components/modals/ExportModal.vue'
import SettingsModal from '../../src/components/modals/SettingsModal.vue'

const importLabels = {
  title: 'Import accounts',
  tabQr: 'QR Image',
  tabFile: 'Text file',
  manualImport: 'Import',
  filePlaceholder: 'Paste URIs',
  qrHint: 'Choose a QR image',
  qrButton: 'Choose image'
}

const exportLabels = {
  title: 'Export accounts',
  selectAll: 'Select all',
  exportQr: 'Export QR',
  exportText: 'Export text'
}

const settingsLabels = {
  title: 'Settings',
  themeLabel: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  languageLabel: 'Language',
  languageSystem: 'System',
  languageEn: 'English',
  languageZh: '中文'
}

describe('Modal availability', () => {
  it('renders import modal actions', () => {
    const wrapper = mount(ImportModal, { props: { open: true, labels: importLabels } })
    expect(wrapper.text()).toContain('Import accounts')
    expect(wrapper.text()).toContain('QR Image')
    expect(wrapper.text()).toContain('Text file')
  })

  it('renders export modal actions', () => {
    const wrapper = mount(ExportModal, {
      props: {
        open: true,
        accounts: [{
          id: '1', service: 'Google', account: 'user@gmail.com', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, order: 0, createdAt: 1
        }],
        labels: exportLabels
      }
    })
    expect(wrapper.text()).toContain('Export QR')
    expect(wrapper.text()).toContain('Export text')
  })

  it('renders settings modal actions', () => {
    const wrapper = mount(SettingsModal, { props: { open: true, theme: 'system', locale: 'system', labels: settingsLabels } })
    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.text()).toContain('Theme')
    expect(wrapper.text()).toContain('Language')
  })
})
