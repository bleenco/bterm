const Application = require('spectron').Application;
const { resolve } = require('path');
import { expect } from 'chai';
import { wait } from './helpers';

let getElectronPath = () => {
  let electronPath = resolve(__dirname, '../../node_modules/.bin/electron');
  return (process.platform === 'win32') ? electronPath += '.cmd' : electronPath;
}

let getAppInstance = () => {
  return new Application({
    path: getElectronPath(),
    args: [resolve(__dirname, '../../dist')],
    env: { SPECTRON: true }
  });
}

describe('bterm basic e2e', function() {
  let timeout = (mseconds) => this.timeout(mseconds);
  let app: any;
  timeout(120000);

  beforeEach(() => {
    this.app = getAppInstance();
    return this.app.start();
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

  if (process.platform !== 'win32') {
    it('should be focused on app after start', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.browserWindow.isFocused())
        .then(result => expect(result).to.be.true);
    });

    it('should have focus after click', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.click('.terminal-instance'))
        .then(() => this.app.client.browserWindow.isFocused('.terminal-instance'))
        .then(result => expect(result).to.be.true);
    });

    it('should give focus to clicked theme', () => {
      return this.app.client.waitUntilWindowLoaded()
        .then(() => this.app.client.click('.menu-open'))
        .then(() => wait(1000))
        .then(() => this.app.client.click('.theme-browser > span:nth-child(2)'))
        .then(() => wait(1000))
        .then(() => this.app.client.browserWindow.isFocused('.theme-browser > span:nth-child(2)'))
        .then(result => expect(result).to.be.true);
    });
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
      .then(() => wait(1000))
      .then(() => this.app.client.click('.theme-browser > span:nth-child(2)'))
      .then(() => wait(1000))
      .then(() => this.app.client.getAttribute('.theme-browser > span:nth-child(2)', 'style'))
      .then((style) => styleProp = style)
      .then(() => this.app.client.click('.theme-browser > span:nth-child(3)'))
      .then(() => wait(2000))
      .then(() => this.app.client.getAttribute('.theme-browser > span:nth-child(2)', 'style'))
      .then((style) => expect(style).to.not.equal(styleProp))
  });

  it('should close the right menu', () => {
    return this.app.client.waitUntilWindowLoaded()
      .then(() => this.app.client.isVisibleWithinViewport('.sidebar-container'))
      .then(result => expect(result).to.be.false)
      .then(() => this.app.client.click('.menu-open'))
      .then(() => wait(1000))
      .then(() => this.app.client.isVisibleWithinViewport('.sidebar-container'))
      .then(result => expect(result).to.be.true)
      .then(() => this.app.client.click('.close-icon'))
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
});


describe('bterm e2e', function() {
  let timeout = (mseconds) => this.timeout(mseconds);
  timeout(12000);

  it('should open and close multi window of the app', () => {
    let app = getAppInstance();

    return app.start()
      .then(() => app.client.waitUntilWindowLoaded())
      .then(() => app.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'N', modifiers: ['CommandOrControl'] }))
      .then(() => app.client.getWindowCount())
      .then(count => expect(count).to.be.equal(2))
      .then(() => app.stop());
  });
});

