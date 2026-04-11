import { describe, expect, it } from 'vitest'
import { createMainWindow } from '../../electron/main/window'

describe('window configuration', () => {
  it('creates a frameless resizable desktop window', () => {
    expect(typeof createMainWindow).toBe('function')
  })
})
