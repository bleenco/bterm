let electron = require('electron');
let { app, BrowserWindow, globalShortcut, ipcMain } = electron;
import menu from './app/menu';

let current: Electron.BrowserWindow = null;

function createWindow(): void {
  let win: Electron.BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true
  });

  win.setMenu(null);

  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', () => {
    win = null;
  });

  registerShortcuts(win);
  win.on('focus', () => registerShortcuts(win));
  win.on('blur', () => unregisterShortcuts());
  win.on('move', () => win.webContents.send('focusCurrent', true));

  current = win;
}

app.on('ready', () => {
  menu();
  createWindow();

  globalShortcut.register('CommandOrControl+N', () => {
    createWindow();
  });

  ipcMain.on('minimize', () => {
    let isMinimized = current.isMinimized();
    if (!isMinimized) {
      current.minimize();
    }
  });

  ipcMain.on('maximize', () => {
    let isFullScreen = current.isFullScreen();
    current.setFullScreen(!isFullScreen);
  });

  ipcMain.on('close', () => {
    unregisterShortcuts();
    current.close();
  });

  ipcMain.on('closeApp', () => {
    unregisterShortcuts();
    current.close();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (current === null) {
    createWindow();
  }
});

function registerShortcuts(win: Electron.BrowserWindow): void {
  globalShortcut.register('CommandOrControl+T', () => win.webContents.send('newTab', true));
  globalShortcut.register('CommandOrControl+Shift+Left', () => win.webContents.send('tabLeft', true));
  globalShortcut.register('CommandOrControl+Shift+Right', () => win.webContents.send('tabRight', true));
  globalShortcut.register('CommandOrControl+1', () => win.webContents.send('switchTab', 0));
  globalShortcut.register('CommandOrControl+2', () => win.webContents.send('switchTab', 1));
  globalShortcut.register('CommandOrControl+3', () => win.webContents.send('switchTab', 2));
  globalShortcut.register('CommandOrControl+4', () => win.webContents.send('switchTab', 3));
  globalShortcut.register('CommandOrControl+5', () => win.webContents.send('switchTab', 4));
  globalShortcut.register('CommandOrControl+6', () => win.webContents.send('switchTab', 5));
  globalShortcut.register('CommandOrControl+7', () => win.webContents.send('switchTab', 6));
  globalShortcut.register('CommandOrControl+8', () => win.webContents.send('switchTab', 7));
  globalShortcut.register('CommandOrControl+9', () => win.webContents.send('switchTab', 8));
  globalShortcut.register('CommandOrControl+0', () => win.webContents.send('switchTab', 9));
}

function unregisterShortcuts(): void {
  globalShortcut.unregister('CommandOrControl+T');
  globalShortcut.unregister('CommandOrControl+Shift+Left');
  globalShortcut.unregister('CommandOrControl+Shift+Right');
  globalShortcut.unregister('CommandOrControl+1');
  globalShortcut.unregister('CommandOrControl+2');
  globalShortcut.unregister('CommandOrControl+3');
  globalShortcut.unregister('CommandOrControl+4');
  globalShortcut.unregister('CommandOrControl+5');
  globalShortcut.unregister('CommandOrControl+6');
  globalShortcut.unregister('CommandOrControl+7');
  globalShortcut.unregister('CommandOrControl+8');
  globalShortcut.unregister('CommandOrControl+9');
  globalShortcut.unregister('CommandOrControl+0');
}
