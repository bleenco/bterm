let electron = require('electron');
let { app, BrowserWindow, globalShortcut, ipcMain } = electron;
const WindowStateManager = require('electron-window-state-manager');
import menu from './app/menu';
import { keyboardShortcuts } from './keyboard-shortcuts';

let current: Electron.BrowserWindow = null;
let windows = [];

const mainWindowState = new WindowStateManager('mainWindow', {
  defaultWidth: 600,
  defaultHeight: 460
});

function createWindow(): Electron.BrowserWindow {
  let win: Electron.BrowserWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    frame: false,
    transparent: process.platform === 'win32' ? false : true
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
    let isMac = process.platform === 'darwin'
    if (isMac) {
      current.setFullScreen(!current.isFullScreen());
    } else {
      current.isMaximized() ? current.unmaximize() : current.maximize();
    }
  });

  ipcMain.on('close', () => {
    handleWindowsOnClose();
  });

  ipcMain.on('closeApp', () => {
    handleWindowsOnClose();
  });
});

app.on('browser-window-created', (e: Event, win: Electron.BrowserWindow) => {
  handleWindowsOnStart(win);
  registerShortcuts(current);

  current.on('blur', () => unregisterShortcuts());
  current.on('focus', () => registerShortcuts(current));
  current.on('move', () => current.webContents.send('focusCurrent', true));
});

app.on('browser-window-focus', (e: Event, win: Electron.BrowserWindow) => {
  handleWindowsOnStart(win);
});

app.on('activate', () => {
  if (current === null) {
    current = createWindow();
  }
});

function handleWindowsOnStart(win: Electron.BrowserWindow) {
  current = win;
  if (!windows.filter(w => w.id === win.id).length) {
    windows.push(win);
  }
}

function handleWindowsOnClose() {
  unregisterShortcuts();
  mainWindowState.saveState(current);
  windows = windows.filter(w => w.id !== current.id);
  current.close();
  current = windows[windows.length - 1] || null;
}

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
