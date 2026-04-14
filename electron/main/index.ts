import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.show()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    const window = createMainWindow()

    window.on('ready-to-show', () => {
      window.show()
    })

    const trayController = registerIpcHandlers(window)

    window.on('close', (event) => {
      if (!trayController.canQuit()) {
        event.preventDefault()
        window.hide()
      } else {
        trayController.destroyTray()
      }
    })

    if (process.env.VITE_DEV_SERVER_URL) {
      window.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
      window.loadFile('out/renderer/index.html')
    }
  })
}
