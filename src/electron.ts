let electron = require('electron');
let { app, BrowserWindow, globalShortcut, ipcMain } = electron;
const WindowStateManager = require('electron-window-state-manager');
import menu from './app/menu';
import { platform } from 'os';
import { checkNewVersion } from './utils';

let current: Electron.BrowserWindow = null;
let osPlatform: String = null;

const mainWindowState = new WindowStateManager('mainWindow', {
    defaultWidth: 600,
    defaultHeight: 460
});

function createWindow(): Electron.BrowserWindow {
  osPlatform = platform();
  let win: Electron.BrowserWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    frame: false,
    transparent: osPlatform === 'win32' ? false : true
  });

  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);

  return win;
}

app.on('ready', () => {
  let m = menu();
  let win = createWindow();
  win.setMenu(m);

  ipcMain.on('minimize', () => {
    if (!current.isMinimized()) {
      current.minimize();
    }
  });

  ipcMain.on('maximize', () => {
    let isFullScreen = null;
    if (osPlatform === "linux" || osPlatform === "win32") {
      isFullScreen = current.isMaximized();
      if (!isFullScreen) {
        current.maximize();
      } else {
       current.unmaximize()
      }
    } else {
      isFullScreen = current.isFullScreen();
      current.setFullScreen(!isFullScreen);
    }
  });

  ipcMain.on('close', () => {
    if (current) {
      mainWindowState.saveState(current);
      unregisterShortcuts();
      current.close();
      current = null;
    }
  });

  ipcMain.on('closeApp', () => {
    unregisterShortcuts();
    if (current) {
      mainWindowState.saveState(current);
      current.close();
      current = null;
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
