import * as OTPAuth from 'otpauth'
import protobuf from 'protobufjs/light'
import type { Account } from '../types/account'

const root = protobuf.Root.fromJSON({
  nested: {
    MigrationPayload: {
      fields: {
        otpParameters: { rule: 'repeated', type: 'OtpParameters', id: 1 },
        version: { type: 'int32', id: 2 },
        batchSize: { type: 'int32', id: 3 },
        batchIndex: { type: 'int32', id: 4 },
        batchId: { type: 'int32', id: 5 }
      },
      nested: {
        OtpParameters: {
          fields: {
            secret: { type: 'bytes', id: 1 },
            name: { type: 'string', id: 2 },
            issuer: { type: 'string', id: 3 },
            algorithm: { type: 'int32', id: 4 },
            digits: { type: 'int32', id: 5 },
            type: { type: 'int32', id: 6 },
            counter: { type: 'int64', id: 7 }
          }
        }
      }
    }
  }
})

const Payload = root.lookupType('MigrationPayload')

const toBase64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64')
const fromBase64 = (value: string): Uint8Array => Uint8Array.from(Buffer.from(value, 'base64'))

export const encodeMigrationUrl = (accounts: Account[]): string => {
  const message = Payload.create({
    otpParameters: accounts.map((account) => ({
      secret: Uint8Array.from(OTPAuth.Secret.fromBase32(account.secret).bytes),
      name: account.account,
      issuer: account.service,
      algorithm: 1,
      digits: account.digits === 6 ? 1 : 2,
      type: 2,
      counter: 0
    })),
    version: 1,
    batchSize: 1,
    batchIndex: 0,
    batchId: 1
  })

  const bytes = Payload.encode(message).finish()
  return `otpauth-migration://offline?data=${encodeURIComponent(toBase64(bytes))}`
}

export const decodeMigrationUrl = (url: string): Account[] => {
  const data = new URL(url).searchParams.get('data') ?? ''
  const decoded = Payload.decode(fromBase64(decodeURIComponent(data))) as unknown as {
    otpParameters: Array<{
      secret: Uint8Array
      name: string
      issuer: string
      digits: number
    }>
  }

  return decoded.otpParameters.map((item, index) => ({
    id: crypto.randomUUID(),
    service: item.issuer,
    account: item.name,
    secret: OTPAuth.Secret.fromHex(Buffer.from(item.secret).toString('hex')).base32,
    algorithm: 'SHA1' as const,
    digits: item.digits === 1 ? 6 : 8,
    period: 30,
    order: index,
    createdAt: Date.now()
  }))
}
