let electron = require('electron');
let { app, BrowserWindow, globalShortcut, ipcMain } = electron;
const WindowStateManager = require('electron-window-state-manager');
import menu from './app/menu';
import { keyboardShortcuts } from './keyboard-shortcuts';
import { getExtraMargin, WindowPosition } from './utils';
import { platform } from 'os';

let current: Electron.BrowserWindow = null;
let windows = [];
let positionData: WindowPosition = null;

const mainWindowState = new WindowStateManager('mainWindow', {
  defaultWidth: 600,
  defaultHeight: 460
});

function createWindow(): Electron.BrowserWindow {
  let win: Electron.BrowserWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: getPosition('width'),
    y: getPosition('height'),
    frame: false,
    show: false
  });

  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);

  win.on('ready-to-show', () => win.show());

  return win;
}

app.on('ready', () => {
  positionData = {
    screenSize: electron.screen.getPrimaryDisplay().workAreaSize,
    widthLines: 0,
    heightLines: 0,
    width: mainWindowState.x,
    height: mainWindowState.y
  }

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
  current.webContents.on('will-navigate', (ev: Electron.Event, url: string) => {
    ev.preventDefault();
    current.webContents.send('navigate', url);
  });

  current.webContents.on('new-window', (ev: Electron.Event, url: string) => {
    ev.preventDefault();
    current.webContents.send('url-clicked', url);
  });
});

app.on('browser-window-focus', (e: Event, win: Electron.BrowserWindow) => {
  handleWindowsOnStart(win);
});

app.on('activate', () => {
  if (current === null) {
    current = createWindow();
  }
});

function getPosition(attr: string) {
  let attrLines = attr + 'Lines';
  let isHeight = attr === 'height';
  let extraMargin = getExtraMargin(process.platform, positionData[attrLines], positionData[attr], isHeight);
  let position = positionData[attrLines] * 40 + (positionData[attr] + extraMargin);
  let bound = position + mainWindowState.height;
  if (bound > positionData.screenSize[attr]) {
    positionData[attrLines] = positionData[attr] = 0;
    positionData[attr] = getExtraMargin(process.platform, positionData[attrLines], positionData[attr], isHeight);
  } else {
    positionData[attrLines]++;
  }
  return position;
}

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

  if (!windows.length) { setTimeout(() => process.exit(0), 5000); }
}

function registerShortcuts(win: Electron.BrowserWindow): void {
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
