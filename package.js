const path = require('path');
const builder = require('electron-builder');
const fs = require('fs');
const chalk = require('chalk');

const platform = builder.Platform;

let start = new Date();
let pkgJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json')));

builder.build({
  config: {
    appId: pkgJson.name,
    directories: {
      buildResources: path.resolve(__dirname, 'node_modules'),
      app: path.resolve(__dirname, 'build'),
      output: path.resolve(__dirname, 'dist'),
    },
    compression: 'normal',
    extraResources: [],
    mac: {
      icon: path.resolve(__dirname, 'assets/icon.icns')
    },
    dmg: {
      icon: path.resolve(__dirname, 'assets/icon.icns')
    },
    nsis: {
      installerIcon: path.resolve(__dirname, 'assets/icon.ico'),
      installerHeaderIcon: path.resolve(__dirname, 'assets/icon.ico')
    },
    win: {
      icon: path.resolve(__dirname, 'assets/icon.ico'),
    },
    linux: {
      target: 'deb',
      category: 'development',
      icon: path.resolve(__dirname, 'assets')
    }
  }
})
.then(() => {
  let time = new Date().getTime() - start.getTime();
  console.log(`${chalk.green('✔')} Packaging successful in ${time}ms`);
})
.catch(err => console.error(err));
