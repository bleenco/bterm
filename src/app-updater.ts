import { BrowserWindow as BrowserWindowElectron } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as os from 'os';

export default class AppUpdater {
  constructor() {

    const platform = os.platform();
    if (platform === 'linux') {
      return;
    }

    const log = require('electron-log')
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    autoUpdater.signals.updateDownloaded(it => {
      notify('A new update is ready to install', `Version ${it.version} is downloaded and will be automatically installed on Quit`)
    });

    autoUpdater.checkForUpdates();
  }
}

function notify(title: string, message: string) {
  let windows = BrowserWindowElectron.getAllWindows();
  if (!windows.length) {
    return;
  }

  windows[0].webContents.send('notify', title, message);
}
