const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const APP_URL = process.env.DINEFLOW_URL || 'https://restaurant-dineflow.vercel.app';
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'Restaurant DineFlow Desktop',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.loadURL(APP_URL);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('df:app-info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  hostname: os.hostname(),
  userData: app.getPath('userData')
}));

ipcMain.handle('df:local-backup', async (_e, payload) => {
  const dir = path.join(app.getPath('userData'), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `dineflow-backup-${new Date().toISOString().slice(0,10)}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return { ok: true, file };
});

ipcMain.handle('df:list-printers', async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('df:print-html', async (_e, { html, silent = true, deviceName = '' }) => {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: false } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  return new Promise((resolve) => {
    win.webContents.print({ silent, printBackground: true, deviceName }, (success, failureReason) => {
      win.close();
      resolve({ ok: success, error: failureReason });
    });
  });
});
