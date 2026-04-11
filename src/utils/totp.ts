import * as OTPAuth from 'otpauth'
import type { Account } from '../types/account'

export const createTotpToken = (account: Account, timestamp = Date.now()): string => {
  const totp = new OTPAuth.TOTP({
    issuer: account.service,
    label: account.account,
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
    secret: account.secret
  })

  return totp.generate({ timestamp })
}

export const getTokenProgress = (period: number, timestamp = Date.now()): number => {
  const elapsedSeconds = Math.floor(timestamp / 1000) % period
  return Math.round(((period - elapsedSeconds) / period) * 100)
}
