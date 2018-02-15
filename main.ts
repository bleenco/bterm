import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
import * as url from 'url';

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

function createWindow() {
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
    vibrancy: 'light',
    titleBarStyle: 'hiddenInset'
  });

  win.loadURL(url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, '/index.html'),
    slashes:  true
  }));

  if (serve) {
    // win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);
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
