let electron = require('electron');
let { app, BrowserWindow, globalShortcut, ipcMain } = electron;
import menu from './app/menu';

let current: Electron.BrowserWindow = null;

function createWindow(): Electron.BrowserWindow {
  let win: Electron.BrowserWindow = new BrowserWindow({
    width: 600,
    height: 480,
    frame: false,
    transparent: true
  });
  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);

  return win;
}

app.on('ready', () => {
  menu();
  createWindow();

  ipcMain.on('minimize', () => {
    if (!current.isMinimized()) {
      current.minimize();
    }
  });

  ipcMain.on('maximize', () => {
    let isFullScreen = current.isFullScreen();
    current.setFullScreen(!isFullScreen);
  });

  ipcMain.on('close', () => {
    if (current) {
      unregisterShortcuts();
      current.close();
    }
  });

  ipcMain.on('closeApp', () => {
    unregisterShortcuts();
    if (current) {
      current.close();
    }
  });
});

app.on('browser-window-created', (e: Event, win: Electron.BrowserWindow) => {
  current = win;
  registerShortcuts(current);

  current.on('blur', () => unregisterShortcuts());
  current.on('focus', () => registerShortcuts(current));
  current.on('move', () => current.webContents.send('focusCurrent', true));
});

app.on('browser-window-focus', (e: Event, win: Electron.BrowserWindow) => {
  current = win;
});

app.on('activate', () => {
  if (current === null) {
    current = createWindow();
  }
});

function registerShortcuts(win: Electron.BrowserWindow): void {
  globalShortcut.register('CommandOrControl+T', () => win.webContents.send('newTab', true));
  globalShortcut.register('CommandOrControl+N', () => createWindow());
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
  globalShortcut.unregister('CommandOrControl+N');
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
