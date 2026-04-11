import { app } from 'electron'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc'

app.whenReady().then(() => {
  registerIpcHandlers()

  const window = createMainWindow()
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    window.loadFile('out/renderer/index.html')
  }
})
