import { Application } from 'spectron';
import { resolve } from 'path';

const getElectronPath = () => {
  let electronPath = resolve(__dirname, '../../node_modules/.bin/electron');
  if (process.platform === 'win32') {
    electronPath += '.cmd';
  }
  return electronPath;
}

const startApplication = () => {
  return new Application({
    path: getElectronPath(),
    args: [resolve(__dirname, '../../dist')],
    env: { SPECTRON: true }
  }).start();
}

describe('bterm', () => {
  let app: Application;

  beforeAll(() => startApplication().then(startedApp => app = startedApp));

  afterAll(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  })

  it('should show an initial window', () => {
    return app.client.waitUntilWindowLoaded()
      .then(() => app.client.getWindowCount())
      .then(count => expect(count).toEqual(1));
  });

  it('should be visible', () => {
    return app.client.waitUntilWindowLoaded()
      .then(() => app.browserWindow.isVisible())
      .then(res => expect(res).toBeTruthy());
  });

  it('should not be minimized', () => {
    return app.client.waitUntilWindowLoaded()
      .then(() => app.browserWindow.isMinimized())
      .then(res => expect(res).toBeFalsy());
  });

  it('should check if globalShortcuts are registered', () => {
    return app.client.waitUntilWindowLoaded()
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+O'))
      .then((result) => expect(result).toBeFalsy()) // First is not existing that shpuld be false
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+Left'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+Right'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+T'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+W'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+K'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+1'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+2'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+3'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+4'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+5'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+6'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+7'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+8'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+9'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+0'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+N'))
      .then((result) => expect(result).toBeTruthy())
      .then(() => app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+I'))
      .then((result) => expect(result).toBeTruthy())
  });

  it('should have a width', () => {
    return app.client.waitUntilWindowLoaded()
      .then(() => app.browserWindow.getBounds())
      .then(result => {
        expect(result.width).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeDefined();
        expect(result.height).toBeGreaterThan(0);
      });
  });

  it('should have the app title', () => {
    return app.client.waitUntilWindowLoaded()
      .then(() => app.browserWindow.getTitle())
      .then(title => expect(title).toEqual('bterm'));
  });

});
