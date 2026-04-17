import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell, dialog } from 'electron'
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'

let tray: Tray | null = null
let allowQuit = false

function getTrayIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'assets', 'tray-icon.png')
  }
  return join(__dirname, '../../electron/assets/tray-icon.png')
}

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

  ipcMain.handle('dialog:saveFile', async (_event, { content, defaultName }: { content: string; defaultName: string }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      defaultPath: defaultName,
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    })
    if (canceled || !filePath) return false
    await writeFile(filePath, content, 'utf-8')
    return true
  })

  try {
    if (!tray) {
      const trayIcon = nativeImage.createFromPath(getTrayIconPath())
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
  } catch (error) {
    console.error('Failed to create tray icon:', error)
  }

  return {
    canQuit: () => allowQuit,
    destroyTray: () => {
      tray?.destroy()
      tray = null
    }
  }
}
