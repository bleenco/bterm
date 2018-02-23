import { app, BrowserWindow, screen, ipcMain, globalShortcut } from 'electron';
import { getMenu } from './src/app/menu';
import { keyboardShortcuts } from './src/app/keyboard-shortcuts';
import * as path from 'path';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
import * as url from 'url';

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

app.on('ready', () => {
  const appWindow = createWindow();

  ipcMain.on('minimize', () => appWindow.minimize());
  ipcMain.on('tabMaximize', () => appWindow.isMaximized() ? appWindow.unmaximize() : appWindow.maximize());
  ipcMain.on('maximize', () => {
    const isMac = process.platform === 'darwin'
    if (isMac) {
      appWindow.setFullScreen(!appWindow.isFullScreen());
    } else {
      appWindow.isMaximized() ? appWindow.unmaximize() : appWindow.maximize();
    }
  });
  ipcMain.on('close', () => {
    unregisterShortcuts();
    appWindow.close();
  });
  ipcMain.on('closeApp', () => {
    unregisterShortcuts();
    appWindow.close();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const display = electronScreen.getPrimaryDisplay();

  let width = Math.floor(display.workAreaSize.width * 0.7);
  let height = Math.floor(display.workAreaSize.height * 0.7);

  if (width > 1440) {
    width = 1440;
  }

  if (height > 900) {
    height = 900;
  }

  win = new BrowserWindow({
    width,
    height,
    center: true,
    frame: false,
    show: false
  });

  win.setMenu(getMenu());

  win.loadURL(url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, '/index.html'),
    slashes:  true
  }));

  if (serve) {
    // win.webContents.openDevTools();
  }

  registerShortcuts(win);

  win.once('ready-to-show', () => win.show());
  win.on('blur', () => unregisterShortcuts());
  win.on('focus', () => registerShortcuts(win));
  win.on('closed', () => win = null);
  win.on('move', event => win.webContents.send('move', event));

  return win;
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
