import { BrowserWindow, Menu } from 'electron'
import { join } from 'node:path'

export const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 640,
    minHeight: 480,
    frame: true,
    titleBarStyle: 'default',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  Menu.setApplicationMenu(null)

  return win
}
