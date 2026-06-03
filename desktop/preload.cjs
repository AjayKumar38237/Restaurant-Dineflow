const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('DineFlowDesktop', {
  appInfo: () => ipcRenderer.invoke('df:app-info'),
  localBackup: (payload) => ipcRenderer.invoke('df:local-backup', payload),
  listPrinters: () => ipcRenderer.invoke('df:list-printers'),
  printHtml: (payload) => ipcRenderer.invoke('df:print-html', payload)
});
