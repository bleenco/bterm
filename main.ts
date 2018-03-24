import { app, BrowserWindow, screen, ipcMain, globalShortcut } from 'electron';
import { getMenu } from './src/app/menu';
import { keyboardShortcuts } from './src/app/keyboard-shortcuts';
import * as path from 'path';
import * as url from 'url';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

let currentWindow: BrowserWindow = null;
let windows: BrowserWindow[] = [];

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!currentWindow) {
    createWindow();
  }
});

ipcMain.on('minimize', () => currentWindow.minimize());
ipcMain.on('tabMaximize', () => currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize());
ipcMain.on('maximize', () => {
  const isMac = process.platform === 'darwin'
  if (isMac) {
    currentWindow.setFullScreen(!currentWindow.isFullScreen());
  } else {
    currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize();
  }
});
ipcMain.on('close', (ev, id) => {
  currentWindow.close();
});

function createWindow(): void {
  const electronScreen = screen;
  const width = 800;
  const height = 600;

  const win = new BrowserWindow({
    width,
    height,
    center: true,
    frame: false,
    show: false,
    transparent: true
  });

  win.setMenu(getMenu());

  win.loadURL(url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, '/index.html'),
    slashes: true
  }));

  if (serve) {
    // win.webContents.openDevTools();
  }

  registerShortcuts(win);

  win.once('ready-to-show', () => win.show());
  win.on('blur', () => {
    currentWindow = null;
    unregisterShortcuts();
  });
  win.on('focus', () => {
    currentWindow = win;
    registerShortcuts(win);
  });
  win.on('move', event => win.webContents.send('move', event));
  win.on('close', () => {
    windows = windows.filter(w => w.id !== currentWindow.id);
    currentWindow = null;
    unregisterShortcuts();
  });

  windows.push(win);
}

function registerShortcuts(window: any): void {
  const keypressFunctions = {
    send: (key, value) => window.webContents.send(key, value),
    toggleDevTools: () => window.webContents.toggleDevTools(),
    createWindow: () => createWindow()
  };

  keyboardShortcuts.forEach(shortcut => {
    globalShortcut.register(shortcut.keypress, () => {
      keypressFunctions[shortcut.sctype](shortcut.sckey, shortcut.scvalue);
    });
  });
}

function unregisterShortcuts(): void {
  keyboardShortcuts.forEach(shortcut => {
    globalShortcut.unregister(shortcut.keypress);
  });
}
