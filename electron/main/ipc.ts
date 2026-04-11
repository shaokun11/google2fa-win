import { BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron'

let tray: Tray | null = null

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

  ipcMain.handle('clipboard:writeText', (_event, value: string) => {
    return value
  })

  if (!tray) {
    const image = nativeImage.createEmpty()
    tray = new Tray(image)
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
          tray?.destroy()
          tray = null
          window.destroy()
        }
      }
    ]))

    tray.on('double-click', () => {
      window.show()
      window.focus()
    })
  }
}
