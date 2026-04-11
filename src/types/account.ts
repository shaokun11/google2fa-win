export interface Account {
  id: string
  service: string
  account: string
  secret: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512'
  digits: 6 | 8
  period: number
  order: number
  createdAt: number
}
