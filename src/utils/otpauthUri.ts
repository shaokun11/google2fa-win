import * as OTPAuth from 'otpauth'
import type { Account } from '../types/account'

export const parseOtpAuthUri = (uri: string): Account => {
  const parsed = OTPAuth.URI.parse(uri) as OTPAuth.TOTP

  return {
    id: crypto.randomUUID(),
    service: parsed.issuer || '',
    account: parsed.label || '',
    secret: parsed.secret.base32,
    algorithm: parsed.algorithm as 'SHA1' | 'SHA256' | 'SHA512',
    digits: parsed.digits as 6 | 8,
    period: parsed.period,
    order: 0,
    createdAt: Date.now()
  }
}

export const stringifyOtpAuthUri = (account: Account): string => {
  const totp = new OTPAuth.TOTP({
    issuer: account.service,
    label: account.account,
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
    secret: account.secret
  })

  return totp.toString()
}
