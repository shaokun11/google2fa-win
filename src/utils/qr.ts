import QrScanner from 'qr-scanner'
import QRCode from 'qrcode'

export const decodeQrImage = async (file: File): Promise<string> => {
  return QrScanner.scanImage(file, { returnDetailedScanResult: false })
}

export const generateQrDataUrl = async (value: string): Promise<string> => {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280
  })
}
