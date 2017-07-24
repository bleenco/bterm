"use strict";

var packager = require('electron-packager');
const pkg = require('./package.json');
const argv = require('minimist')(process.argv.slice(1));
const { join } = require('path');

const appName = argv.name || pkg.name;
const buildVersion = pkg.version || '1.0';
const shouldUseAsar = argv.asar || false;
const shouldBuildAll = argv.all || false;
const arch = argv.arch || 'all';
const platform = argv.platform || 'darwin';
const winstaller = require('electron-winstaller');
const debianinstaller = require('electron-installer-debian');
const createdmg = require('electron-installer-dmg');

const DEFAULT_OPTS = {
  dir: './build',
  name: appName,
  asar: shouldUseAsar,
  buildVersion: buildVersion
};


pack(platform, arch, (err, appPath) => {
  if (err) {
    console.log(err);
  } else {
    appPath = appPath[0];
    console.log('Application packaged successfuly!', appPath);
    if (platform === 'win32') {
      winstaller.createWindowsInstaller({
        appDirectory: appPath,
        outputDirectory: join(__dirname, 'dist'),
        authors: pkg.author,
        exe: pkg.name
      }).then(() => {
        console.log('Windows Installer created.');
      });
    } else if (platform === 'linux') {
      debianinstaller({
        src: appPath,
        dest: join(__dirname, 'dist'),
        arch: 'amd64'
      }, err => {
        if (err) {
          console.error(err, err.stack);
          process.exit(1);
        }

        console.log('Linux installer succesfully created.');
      });
    } else if (platform === 'darwin') {
      createdmg({
        overwrite: true,
        name: pkg.name,
        appPath: appPath + '/' + pkg.name + '.app',
        out: join(__dirname, 'dist'),
        icon: join(__dirname, 'assets', 'icon.icns')
      }, err => {
        if (err) {
          console.error(err, err.stack);
          process.exit(1);
        }

        console.log('MacOS Installer successfully created.');
      })
    }
  }
});

function pack(plat, arch, cb) {
  if (plat === 'darwin' && arch === 'ia32') return;

  let icon = 'assets/icon';

  if (icon) {
    DEFAULT_OPTS.icon = icon + (() => {
      let extension = '.png';
      if (plat === 'darwin') {
        extension = '.icns';
      } else if (plat === 'win32') {
        extension = '.ico';
      }
    return extension;
    })();
  }

  const opts = Object.assign({}, DEFAULT_OPTS, {
    platform: plat,
    arch,
    prune: true,
    overwrite: true,
    all: shouldBuildAll,
    out: `dist`
  });

  packager(opts, cb);
}
