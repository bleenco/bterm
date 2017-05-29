const Application = require('spectron').Application;
const { resolve } = require('path');
import { expect } from 'chai';
import { wait } from './helpers';
import { homedir } from 'os';

let getElectronPath = () => {
  let electronPath = resolve(__dirname, '../../node_modules/.bin/electron');
  if (process.platform === 'win32') {
    electronPath += '.cmd';
  }
  return electronPath;
}

let startApplication = () => {
  return new Application({
      path: getElectronPath(),
      args: [resolve(__dirname, '../../dist')],
      env: { SPECTRON: true }
    }).start();
}

describe('bterm launch', function() {
  let timeout = (mseconds) => this.timeout(mseconds);
  let app: any;
  timeout(120000);

  beforeEach(() => {
    return startApplication()
      .then((startedApp) => this.app = startedApp);
  });

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('should show an initial window', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.getWindowCount())
      .then(count => expect(count).to.equal(1));
  });

  it('should be visible', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.isVisible())
      .then(result => expect(result).to.be.true);
  });

  it('should not be minimized', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.isMinimized())
      .then(result => expect(result).to.be.false);
  });

  it('should minimize the application after click on minimize', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.click('.minimize'))
      .then(() => wait(1000))
      .then(() => this.app.client.browserWindow.isMinimized())
      .then(result => expect(result).to.be.true);
  });

  it('should maximize the application after click on maximize', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.click('.maximize'))
      .then(() => wait(1000))
      .then(() => {
        if (process.platform === 'darwin') {
          this.app.client.browserWindow.isFullScreen()
          .then(result => expect(result).to.be.true);
        } else {
          this.app.client.browserWindow.isMaximized()
          .then(result => expect(result).to.be.true);
        }
      })
      .then(() => wait(1000))
      .then(() => this.app.client.click('.maximize'))
      .then(() => wait(1000))
      .then(() => {
        if (process.platform === 'darwin') {
          this.app.client.browserWindow.isFullScreen()
          .then(result => expect(result).to.be.false);
        } else {
          this.app.client.browserWindow.isMaximized()
          .then(result => expect(result).to.be.fasle);
        }
      })
  });

  if (process.platform !== 'win32') {
    it('should be focused on app after start', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.browserWindow.isFocused())
        .then(result => expect(result).to.be.true);
    });

    it('should have focus on terminal after new tab is opened', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => wait(1000))
        .then(() => this.app.client.browserWindow.send('newTab', true))
        .then(() => wait(2000))
        .then(() => this.app.client.hasFocus('.active textarea'))
        .then(result => expect(result).to.be.true);
    });

    it('should check if globalShortcut is registered', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+O'))
        .then((result) => expect(result).to.be.false) // First is not existing that shpuld be false
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+Left'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+Right'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+T'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+W'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+K'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+1'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+2'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+3'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+4'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+5'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+6'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+7'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+8'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+9'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+0'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+N'))
        .then((result) => expect(result).to.be.true)
        .then(() => this.app.electron.remote.globalShortcut.isRegistered('CommandOrControl+Shift+I'))
        .then((result) => expect(result).to.be.true)
    })
  }

  it('should have a width', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.getBounds())
      .then(result => {
        expect(result).to.have.property('width');
        expect(result.width).to.be.above(0);
        expect(result).to.have.property('height');
        expect(result.height).to.be.above(0);
      });
  });

  it('should have the app title', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.getTitle())
      .then(title => expect(title).to.equal('bterm'));
  });

  it('should have the shell title', () => {
    // TODO: This is not valid when using zsh or fish shell
  });

  it('should open the right menu', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.click('.menu-open'))
      .then(() => wait(1000))
      .then(() => this.app.client.isVisibleWithinViewport('.sidebar-container'))
      .then(result => expect(result).to.be.true);
  });

  it('should have correct text on right menu', () => {
    let theme = '';
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.click('.menu-open'))
      .then(() => wait(1000))
      .then(() => this.app.client.click('.theme-browser > span:nth-child(2)'))
      .then(() => wait(1000))
      .then(() => this.app.client.getText('.theme-browser > span:nth-child(2)'))
      .then(result => theme = result)
      .then(() => this.app.client.getText('.sidebar-container h1'))
      .then(result => expect(result).to.equal(`Theme Browser (${theme})`))
      .then(() => this.app.client.click('.theme-browser > span:nth-child(3)'))
      .then(() => wait(1000))
      .then(() => this.app.client.getText('.theme-browser > span:nth-child(3)'))
      .then(result => theme = result)
      .then(() => this.app.client.getText('.sidebar-container h1'))
      .then(result => expect(result).to.equal(`Theme Browser (${theme})`));
  });

  it('should have clicked theme selected', () => {
    let styleProp = '';
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.click('.menu-open'))
      .then(() => wait(2000))
      .then(() => this.app.client.click('.theme-browser > span:nth-child(2)'))
      .then(() => wait(2000))
      .then(() => this.app.client.getAttribute('.theme-browser > span:nth-child(2)', 'style'))
      .then((style) => styleProp = style)
      .then(() => wait(2000))
      .then(() => this.app.client.click('.theme-browser > span:nth-child(3)'))
      .then(() => wait(3000))
      .then(() => this.app.client.getAttribute('.theme-browser > span:nth-child(2)', 'style'))
      .then((style) => expect(style).to.not.equal(styleProp))
  });

  it('should close the right menu', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.isVisibleWithinViewport('.sidebar-container'))
      .then(result => expect(result).to.be.false)
      .then(() => this.app.client.click('.menu-open'))
      .then(() => wait(2000))
      .then(() => this.app.client.isVisibleWithinViewport('.sidebar-container'))
      .then(result => expect(result).to.be.true)
      .then(() => this.app.client.click('.sidebar .close-icon'))
      .then(() => wait(2000))
      .then(() => this.app.client.isVisibleWithinViewport('.sidebar-container'))
      .then(result => expect(result).to.be.false);
  });

  it('should maximize the app with click on header tab', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.doubleClick('.window-top-container'))
      .then(() => wait(1000))
      .then(() => this.app.client.browserWindow.isMaximized())
      .then(result => expect(result).to.be.true);
  });

  it('should open and close multi window of the app', () => {
    let appToClose = null;
    let appToMinimize = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => startApplication()
      .then((startedApp) => appToClose = startedApp))
      .then(() => appToClose.client.waitUntilWindowLoaded())
      .then(() => startApplication()
      .then((startedApp) => appToMinimize = startedApp))
      .then(() => appToMinimize.client.waitUntilWindowLoaded())
      .then(() => appToClose.stop())
      .then(() => wait(1000))
      .then(() => appToClose.isRunning())
      .then(result => expect(result).to.be.false)
      .then(() => appToMinimize.client.click('.minimize'))
      .then(() => wait(1000))
      .then(() => appToMinimize.client.browserWindow.isMinimized())
      .then(result => expect(result).to.be.true)
      .then(() => appToMinimize.stop())
      .then(() => wait(1000))
      .then(() => appToMinimize.isRunning())
      .then(result => expect(result).to.be.false);
  });

  it('should open new tabs correctly', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(el.value.length).to.equal(2))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(el.value.length).to.equal(3));
  });

  it('should have only one active tab', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => expect(el.value.length).to.equal(1));
  });

  it('should have the latest tab active', () => {
    let activeTab = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[2].ELEMENT).toFixed(2)));
  });

  it('should switch to tab left', () => {
    let activeTab = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(3000))
      .then(() => this.app.client.browserWindow.send('tabLeft', true))
      .then(() => wait(3000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[1].ELEMENT).toFixed(2)));
  });

  it('should switch to tab right', () => {
    let activeTab = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(3000))
      .then(() => this.app.client.browserWindow.send('tabLeft', true))
      .then(() => wait(3000))
      .then(() => this.app.client.browserWindow.send('tabRight', true))
      .then(() => wait(3000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[2].ELEMENT).toFixed(2)));
  });

  it('should switch to tab number', () => {
    let activeTab = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(3000))
      .then(() => this.app.client.browserWindow.send('switchTab', 0))
      .then(() => wait(3000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[0].ELEMENT).toFixed(2)))
      .then(() => this.app.client.browserWindow.send('switchTab', 1))
      .then(() => wait(3000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[1].ELEMENT).toFixed(2)))
      .then(() => this.app.client.browserWindow.send('switchTab', 2))
      .then(() => wait(3000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[2].ELEMENT).toFixed(2)))
  });

  it('should switch to tab by click', () => {
    let activeTab = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[1].ELEMENT).toFixed(2)))
      .then(() => this.app.client.click('.tab'))
      .then(() => this.app.client.elements('.is-active'))
      .then((el) => activeTab = parseFloat(el.value[0].ELEMENT).toFixed(2))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(activeTab).to.equal(parseFloat(el.value[0].ELEMENT).toFixed(2)))
  });

  it('should close tabs', () => {
    let activeTab = null;
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('newTab', true))
      .then(() => this.app.client.browserWindow.send('closeTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(el.value.length).to.equal(2))
      .then(() => this.app.client.browserWindow.send('closeTab', true))
      .then(() => wait(1000))
      .then(() => this.app.client.elements('.tab'))
      .then((el) => expect(el.value.length).to.equal(1))
  });

  if (process.platform === 'win32') {
    it('should start with clear terminal', () => {
      let activeTab = null;
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(1)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(2)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(4)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(5)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(6)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
    });

    it('should clear the terminal', () => {
      let activeTab = null;
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.keys('dir \r\n'))
        .then(() => wait(2000))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(1)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(2)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(4)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(5)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(6)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.browserWindow.send('clearTab', true))
        .then(() => wait(3000))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(4)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(5)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(6)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
    });
  }
  if (process.platform === 'darwin') {
    it('should start with clear terminal', () => {
      let activeTab = null;
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(1)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(2)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
    });

    it('should clear the terminal', () => {
      let activeTab = null;
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.keys('ls \n'))
        .then(() => wait(2000))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(1)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(2)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.browserWindow.send('clearTab', true))
        .then(() => wait(3000))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(1)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(2)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
    });
  }

  if (process.platform === 'linux') {
    it('should start with clear terminal', () => {
      let activeTab = null;
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(2)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
    });

    it('should clear the terminal', () => {
      let activeTab = null;
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.browserWindow.send('clearTab', true))
        .then(() => wait(3000))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(1)'))
        .then((result) => expect(result.replace(/ /g, '')).to.not.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(3)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
        .then(() => this.app.client.getText('.xterm-rows div:nth-child(4)'))
        .then((result) => expect(result.replace(/ /g, '')).to.equal(''))
    });
  }

  it('should inject a style element into head', () => {
  return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.elements('head style'))
      .then(result => expect(result.value.length).to.equal(1));
  });

  it('should close tab on \'x\' tab icon click', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.browserWindow.send('newTab', true))
        .then(() => this.app.client.browserWindow.send('newTab', true))
        .then(() => wait(2000))
        .then(() => this.app.client.elements('.tab'))
        .then(result => expect(result.value.length).to.equal(3))
        .then(() => this.app.client.moveToObject('.tab:nth-child(1)').click('.tab:nth-child(1) .close-icon'))
        .then(() => wait(2000))
        .then(() => this.app.client.elements('.tab'))
        .then(result => expect(result.value.length).to.equal(2))
        .then(() => this.app.client.moveToObject('.tab:nth-child(1)').click('.tab:nth-child(1) .close-icon'))
        .then(() => wait(2000))
        .then(() => this.app.client.elements('.tab'))
        .then(result => expect(result.value.length).to.equal(1))
    });

  it('should close a tab with middle click', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.browserWindow.send('newTab', true))
        .then(() => this.app.client.browserWindow.send('newTab', true))
        .then(() => wait(2000))
        .then(() => this.app.client.elements('.tab'))
        .then(result => expect(result.value.length).to.equal(3))
        .then(() => this.app.client.middleClick('.tab:nth-child(1)'))
        .then(() => wait(2000))
        .then(() => this.app.client.elements('.tab'))
        .then(result => expect(result.value.length).to.equal(2))
        .then(() => this.app.client.middleClick('.tab:nth-child(2)'))
        .then(() => wait(2000))
        .then(() => this.app.client.elements('.tab'))
        .then(result => expect(result.value.length).to.equal(1))
    });

    it('should show inner marks on icons on hover', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.moveToObject('.icons'))
        .then(() => this.app.client.isVisibleWithinViewport('.close span'))
        .then(result => expect(result).to.true)
        .then(() => this.app.client.moveToObject('.icons'))
        .then(() => this.app.client.isVisibleWithinViewport('.minimize span'))
        .then(result => expect(result).to.true)
        .then(() => this.app.client.moveToObject('.icons'))
        .then(() => this.app.client.isVisibleWithinViewport('.maximize span'))
        .then(result => expect(result).to.true);
    });

    if (process.platform === 'darwin') {
      it('should disable minimize in full screen', () => {
        return this.app.client.waitUntilWindowLoaded()
          .then(() => this.app.client.click('.maximize'))
          .then(() => wait(1000))
          .then(() => this.app.client.getHTML('.minimize'))
          .then(result => expect(result).to.contain('disabled'))
          .then(() => this.app.client.isVisibleWithinViewport('.minimize span'))
          .then(result => expect(result).to.false)
          .then(() => this.app.client.click('.minimize'))
          .then(() => this.app.client.browserWindow.isMinimized())
          .then(result => expect(result).to.be.false);
      });
    }

  it('should type the uri in terminal on will-navigate', () => {
    let testString: string = '/path/to/blah/random.bleenco.test';
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.browserWindow.send('navigate', testString))
      .then(() => wait(2000))
      .then(() => this.app.client.getText('.terminal-instance'))
      .then(text => expect(text).to.contain(testString));
  });

it('should copy and paste the text', () => {
  let text = 'texttotest';
  let textOut = '';
  return this.app.client.waitUntilWindowLoaded()
    .then(() => this.app.client.keys(text))
    .then(() => wait(1000))
    .then(() => this.app.client.getText('.terminal-instance'))
    .then((result) => textOut = result.replace(/\n|\r/g, '').replace(/ /g, ''))
    .then(() => expect(textOut.endsWith(text)).to.be.true)
    .then(() => this.app.client.browserWindow.send('clearTab', true))
    .then(() => wait(1000))
    .then(() => this.app.client.getText('.terminal-instance'))
    .then((result) => textOut = result.replace(/\n|\r/g, '').replace(/ /g, ''))
    .then(() => expect(textOut.endsWith(text)).to.be.false)
    .then(() => wait(1000))
    .then(() => this.app.client.getSelectedText())
    .then((result) => expect(result).to.equal(''))
    .then(() => this.app.client.webContents.selectAll())
    .then(() => this.app.client.getSelectedText())
    .then((result) => text = result)
    .then(() => expect(text).to.not.equal(''))
    .then(() => this.app.client.webContents.selectAll())
    .then(() => this.app.client.browserWindow.send('copy', true))
    .then(() => this.app.client.browserWindow.send('paste', true))
    .then(() => wait(1000))
    .then(() => this.app.client.getText('.terminal-instance'))
    .then((result) => textOut = result.replace(/\n|\r/g, '').replace(/ /g, ''))
    .then(() => expect(textOut.endsWith(text)).to.be.true)
  });

  it('should copy a link on click', () => {
    let testString: string = 'http://bleenco.com/';
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.keys(testString + '\r\n'))
      .then(() => wait(2000))
      .then(() => this.app.client.pause(3000))
      .then(() => this.app.client.click('.terminal-instance a'))
      .then(() => this.app.client.pause(1000))
      .then(() => this.app.electron.clipboard.readText())
      .then(res => expect(res).to.contain(testString))
  });

  // TODO: uncomment following two tests when `bash` will be default shell
  xit('should show current directory', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => wait(1000))
      .then(() => this.app.client.getText('.current-folder-text'))
      .then(result => expect(result.replace(/~/, homedir())).to.equal(process.cwd()));
  });

  xit('should update current directory', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => wait(1000))
      .then(() => this.app.client.keys('cd ..\r\n'))
      .then(() => wait(1000))
      .then(() => process.chdir('..'))
      .then(() => wait(1000))
      .then(() => this.app.client.getText('.current-folder-text'))
      .then(result => expect(result.replace(/~/, homedir())).to.equal(process.cwd()));
  });
});
