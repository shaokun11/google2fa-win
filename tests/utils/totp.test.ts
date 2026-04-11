import { describe, expect, it, vi } from 'vitest'
import { createTotpToken, getTokenProgress } from '../../src/utils/totp'

describe('totp utils', () => {
  it('generates a stable token for a fixed timestamp', () => {
    const token = createTotpToken({
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      service: 'Google',
      account: 'user@gmail.com',
      id: '1',
      order: 0,
      createdAt: 1
    }, 0)

    expect(token).toHaveLength(6)
    expect(token).toBe('282760')
  })

  it('returns token progress percentage', () => {
    vi.setSystemTime(new Date('1970-01-01T00:00:15.000Z'))
    expect(getTokenProgress(30)).toBe(50)
  })
})
