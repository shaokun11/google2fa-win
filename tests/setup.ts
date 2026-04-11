import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  Object.defineProperty(window, 'electron', {
    writable: true,
    value: {
      openExternal: vi.fn(),
      minimizeWindow: vi.fn(),
      hideToTray: vi.fn(),
      copyText: vi.fn(async (value: string) => {
        await navigator.clipboard.writeText(value)
      })
    }
  })
})
