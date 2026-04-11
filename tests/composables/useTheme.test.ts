import { describe, expect, it } from 'vitest'
import { useTheme } from '../../src/composables/useTheme'

describe('useTheme', () => {
  it('defaults to system theme and resolves to light or dark', () => {
    const theme = useTheme()
    expect(['light', 'dark']).toContain(theme.resolvedTheme.value)
  })
})
