import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppHeader from '../../src/components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders title and actions', () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Authenticator',
        subtitle: 'Google 2FA Desktop',
        search: '',
        searchPlaceholder: 'Search',
        labels: {
          add: 'Add',
          import: 'Import',
          export: 'Export',
          settings: 'Settings'
        }
      }
    })

    expect(wrapper.text()).toContain('Authenticator')
    expect(wrapper.text()).toContain('Add')
    expect(wrapper.text()).toContain('Import')
    expect(wrapper.text()).toContain('Export')
    expect(wrapper.text()).toContain('Settings')
  })
})
