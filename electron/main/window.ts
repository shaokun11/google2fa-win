import { BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'node:path'

export const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 640,
    minHeight: 480,
    frame: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#282c34',
      symbolColor: '#abb2bf',
      height: 32
    },
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  Menu.setApplicationMenu(null)

  ipcMain.handle('window:setTitleBarTheme', (_event, colors: { bg: string; text: string }) => {
    win.setTitleBarOverlay({
      color: colors.bg,
      symbolColor: colors.text,
      height: 32
    })
  })

  return win
}
