import { describe, expect, it } from 'vitest'
import { useI18n } from '../../src/composables/useI18n'

describe('useI18n', () => {
  it('translates known keys', () => {
    const i18n = useI18n()
    i18n.setLocale('en')

    expect(i18n.t('app.title')).toBe('Authenticator')
  })
})
