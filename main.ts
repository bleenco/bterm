import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import { getMenu } from './menu';
import { keyboardShortcuts } from './keyboard-shortcuts';
import * as path from 'path';
import * as url from 'url';
import { platform } from 'os';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
const os = platform();
const showFrame = os === 'darwin' ? false : true;

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
  const isMac = process.platform === 'darwin';
  if (isMac) {
    currentWindow.setFullScreen(!currentWindow.isFullScreen());
  } else {
    currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize();
  }
});
ipcMain.on('close', (ev, id) => {
  if (!currentWindow) {
    return;
  }

  currentWindow.close();
});

function createWindow(): void {
  const width = 640;
  const height = 480;

  const win = new BrowserWindow({
    width,
    height,
    center: true,
    frame: showFrame,
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
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
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
  win.on('resize', event => win.webContents.send('resize', event));
  win.on('restore', event => win.webContents.send('restore', event));
  win.on('enter-full-screen', event => win.webContents.send('enter-full-screen', event));
  win.on('leave-full-screen', event => win.webContents.send('leave-full-screen', event));

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
