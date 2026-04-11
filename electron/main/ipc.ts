import { BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron'
import { join } from 'node:path'

let tray: Tray | null = null
let allowQuit = false

export const registerIpcHandlers = (window: BrowserWindow) => {
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    await shell.openExternal(url)
  })

  ipcMain.handle('window:minimize', () => {
    window.minimize()
  })

  ipcMain.handle('window:hideToTray', () => {
    window.hide()
  })

  ipcMain.handle('window:quit', () => {
    allowQuit = true
    window.close()
  })

  ipcMain.handle('clipboard:writeText', (_event, value: string) => value)

  if (!tray) {
    const trayIcon = nativeImage.createFromPath(join(__dirname, '../assets/tray-icon.svg'))
    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))
    tray.setToolTip('Google 2FA Desktop')
    tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          window.show()
          window.focus()
        }
      },
      {
        label: 'Exit',
        click: () => {
          allowQuit = true
          tray?.destroy()
          tray = null
          window.close()
        }
      }
    ]))

    tray.on('double-click', () => {
      window.show()
      window.focus()
    })
  }

  return {
    canQuit: () => allowQuit,
    destroyTray: () => {
      tray?.destroy()
      tray = null
    }
  }
}
