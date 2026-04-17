export interface ElectronBridge {
  openExternal: (url: string) => Promise<unknown>
  minimizeWindow: () => Promise<unknown>
  hideToTray: () => Promise<unknown>
  quitApplication: () => Promise<unknown>
  copyText: (value: string) => Promise<unknown>
  saveFile: (content: string, defaultName: string) => Promise<boolean>
  setTitleBarTheme: (colors: { bg: string; text: string }) => Promise<unknown>
}

declare global {
  interface Window {
    electron?: ElectronBridge
  }
}

export {}
