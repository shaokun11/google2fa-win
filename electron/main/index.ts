import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'

const createWindow = () => {
  const window = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    window.loadFile(join(__dirname, '../../index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
})
