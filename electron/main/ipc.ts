import { ipcMain, shell } from 'electron'

export const registerIpcHandlers = () => {
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    await shell.openExternal(url)
  })
}
