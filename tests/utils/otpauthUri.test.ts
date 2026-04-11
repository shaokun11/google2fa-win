import { describe, expect, it } from 'vitest'
import { parseOtpAuthUri, stringifyOtpAuthUri } from '../../src/utils/otpauthUri'

const uri = 'otpauth://totp/Google:user@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=Google&algorithm=SHA1&digits=6&period=30'

describe('otpauth uri', () => {
  it('parses a standard TOTP uri', () => {
    expect(parseOtpAuthUri(uri)).toMatchObject({
      service: 'Google',
      account: 'user@gmail.com',
      secret: 'JBSWY3DPEHPK3PXP'
    })
  })

  it('stringifies an account back to a TOTP uri', () => {
    expect(stringifyOtpAuthUri({
      id: '1',
      service: 'Google',
      account: 'user@gmail.com',
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      order: 0,
      createdAt: 1
    })).toContain('otpauth://totp/')
  })
})
