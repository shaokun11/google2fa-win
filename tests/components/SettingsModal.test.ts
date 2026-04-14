import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SettingsModal from '../../src/components/modals/SettingsModal.vue'

const labels = {
  title: 'Settings',
  themeLabel: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeOneDark: 'One Dark',
  languageLabel: 'Language',
  languageSystem: 'System',
  languageEn: 'English',
  languageZh: '中文'
}

describe('SettingsModal', () => {
  it('emits theme and locale preferences', async () => {
    const wrapper = mount(SettingsModal, { props: { open: true, theme: 'system', locale: 'system', labels } })

    await wrapper.get('select[name="theme"]').setValue('dark')
    await wrapper.get('select[name="locale"]').setValue('zh')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({ theme: 'dark', locale: 'zh' })
  })
})
