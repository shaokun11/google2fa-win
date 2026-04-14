export interface ElectronBridge {
  openExternal: (url: string) => Promise<unknown>
  minimizeWindow: () => Promise<unknown>
  hideToTray: () => Promise<unknown>
  quitApplication: () => Promise<unknown>
  copyText: (value: string) => Promise<unknown>
  setTitleBarTheme: (colors: { bg: string; text: string }) => Promise<unknown>
}

declare global {
  interface Window {
    electron?: ElectronBridge
  }
}

export {}
