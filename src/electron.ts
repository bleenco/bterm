const electron = require('electron');
const { app, BrowserWindow, globalShortcut, ipcMain } = electron;
import menu from './app/menu';
import { keyboardShortcuts } from './keyboard-shortcuts';
import { getExtraMargin, WindowPosition } from './utils';
import { platform } from 'os';
import { join } from 'path';
import AppUpdater from './app-updater';

if (process.argv.slice(1).some(val => val === '--serve')) {
  require('electron-reload')(__dirname, {
    electron: join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

let current = null;
let windows = [];

function createWindow(): any {
  let win: any = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    show: false,
    backgroundColor: 'transparent'
  });

  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);

  win.on('ready-to-show', () => win.show());

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

  const updater = new AppUpdater();
});

app.on('browser-window-created', (e: Event, win: any) => {
  handleWindowsOnStart(win);
  registerShortcuts(current);

  current.on('blur', () => unregisterShortcuts());
  current.on('focus', () => registerShortcuts(current));
  current.on('move', () => current.webContents.send('focusCurrent', true));
  current.webContents.on('will-navigate', (ev: any, url: string) => {
    ev.preventDefault();
    current.webContents.send('navigate', url);
  });

  current.webContents.on('new-window', (ev: any, url: string) => {
    ev.preventDefault();
    current.webContents.send('url-clicked', url);
  });
});

app.on('browser-window-focus', (e: Event, win: any) => {
  handleWindowsOnStart(win);
});

app.on('activate', () => {
  if (current === null) {
    current = createWindow();
  }
});

function handleWindowsOnStart(win: any) {
  current = win;
  if (!windows.filter(w => w.id === win.id).length) {
    windows.push(win);
  }
}

function handleWindowsOnClose() {
  unregisterShortcuts();
  windows = windows.filter(w => w.id !== current.id);
  current.close();
  current = windows[windows.length - 1] || null;

  if (!windows.length) { setTimeout(() => process.exit(0), 5000); }
}

function registerShortcuts(win: any): void {
  let keypressFunctions = {
    send: (key, value) => win.webContents.send(key, value),
    toggleDevTools: () => win.webContents.toggleDevTools(),
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
