let electron = require('electron');
let { app, BrowserWindow, globalShortcut, ipcMain } = electron;
const WindowStateManager = require('electron-window-state-manager');
import menu from './app/menu';
import { platform } from 'os';
import { keyboardShortcuts } from './keyboard-shortcuts';

let current: Electron.BrowserWindow = null;
let osPlatform: string = null;

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
    current.minimize();
  });

  ipcMain.on('tabMaximize', () => {
    current.isMaximized() ? current.unmaximize() : current.maximize();
  });

  ipcMain.on('maximize', () => {
    let isMac = osPlatform !== 'darwin'
    if (isMac) {
      current.isMaximized() ? current.unmaximize() : current.maximize();
    } else {
      current.setFullScreen(!current.isFullScreen());
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
  let keypressFunctions = {
    'send': function(key, value){ win.webContents.send(key, value); },
    'toggleDevTools': function(){ win.webContents.toggleDevTools(); },
    'createWindow': function(){ createWindow(); }
  };

  keyboardShortcuts.forEach(shortcut => {
    globalShortcut.register(shortcut.keypress, () => keypressFunctions[shortcut.sctype](shortcut.sckey, shortcut.scvalue));
  });
}

function unregisterShortcuts(): void {
  keyboardShortcuts.forEach(shortcut => {
    globalShortcut.unregister(shortcut.keypress);
  });
}
