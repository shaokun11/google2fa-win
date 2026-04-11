import { clipboard, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  hideToTray: () => ipcRenderer.invoke('window:hideToTray'),
  copyText: (value: string) => {
    clipboard.writeText(value)
    return ipcRenderer.invoke('clipboard:writeText', value)
  }
})
