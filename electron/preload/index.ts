import { clipboard, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  hideToTray: () => ipcRenderer.invoke('window:hideToTray'),
  quitApplication: () => ipcRenderer.invoke('window:quit'),
  copyText: async (value: string) => {
    clipboard.writeText(value)
    return ipcRenderer.invoke('clipboard:writeText', value)
  },
  saveFile: (content: string, defaultName: string) =>
    ipcRenderer.invoke('dialog:saveFile', { content, defaultName }),
  setTitleBarTheme: (colors: { bg: string; text: string }) => ipcRenderer.invoke('window:setTitleBarTheme', colors)
})
