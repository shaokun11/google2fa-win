import { describe, expect, it } from 'vitest'
import { decodeMigrationUrl, encodeMigrationUrl } from '../../src/utils/migrationProto'

const accounts = [{
  id: '1',
  service: 'Google',
  account: 'user@gmail.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  order: 0,
  createdAt: 1
}]

describe('google migration proto', () => {
  it('encodes accounts into a migration url', () => {
    const url = encodeMigrationUrl(accounts)
    expect(url.startsWith('otpauth-migration://offline?data=')).toBe(true)
  })

  it('decodes an encoded migration url back to accounts', () => {
    const url = encodeMigrationUrl(accounts)
    expect(decodeMigrationUrl(url)).toMatchObject([{ service: 'Google', account: 'user@gmail.com' }])
  })
})
