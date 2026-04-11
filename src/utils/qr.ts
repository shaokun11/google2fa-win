import QrScanner from 'qr-scanner'

export const decodeQrImage = async (file: File): Promise<string> => {
  return QrScanner.scanImage(file, { returnDetailedScanResult: false })
}
