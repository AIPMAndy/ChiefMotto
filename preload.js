const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  quitApp: () => ipcRenderer.send('quit-app'),
  hideWindow: () => ipcRenderer.send('hide-window'),
  resizeWindow: (size) => ipcRenderer.send('resize-window', size),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  onShowEdit: (callback) => ipcRenderer.on('show-edit', callback),
  onShowTheme: (callback) => ipcRenderer.on('show-theme', callback),
  onChangeLanguage: (callback) => ipcRenderer.on('change-language', (event, lang) => callback(lang)),
  saveMotto: (motto) => ipcRenderer.invoke('save-motto', motto),
  getMotto: () => ipcRenderer.invoke('get-motto'),
  saveTheme: (theme) => ipcRenderer.invoke('save-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  notifyModalClosed: () => ipcRenderer.send('modal-closed')
});
