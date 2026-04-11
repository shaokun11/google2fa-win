import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.vue'

describe('App bootstrap', () => {
  it('renders the app shell title', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Authenticator')
  })
})
