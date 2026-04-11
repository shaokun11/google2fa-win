import { app } from 'electron'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc'

app.whenReady().then(() => {
  const window = createMainWindow()
  const trayController = registerIpcHandlers(window)

  window.on('ready-to-show', () => {
    window.show()
  })

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
