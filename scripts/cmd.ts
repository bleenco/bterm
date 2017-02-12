import * as chalk from 'chalk';
import * as chokidar from 'chokidar';
import * as path from 'path';
import { Build } from './build';
import { makePackages } from './package';
import {
  generateIndexHtml,
  generateCSS,
  generatePackageJson,
  copyAssets,
  printError
} from './utils';

const electron: any = require('electron-connect').server.create({
  path: path.resolve(__dirname, '../dist'),
  stopOnClose: true,
  logLevel: 0
});

const b: Build = new Build();

function dev(): Promise<null> {
  return new Promise(() => {
    const srcWatcher = chokidar.watch(path.resolve(__dirname, '../src'), {
      persistent: true
    });

    const assetsWatcher = chokidar.watch(path.resolve(__dirname, '../assets'), {
      persistent: true
    });

    srcWatcher.on('ready', () => {
      generateIndexHtml('index_dev.html')
      .then(() => generateCSS())
      .then(() => generatePackageJson())
      .then(() => copyAssets())
      .then(() => b.run('electron.ts', 'electron.js', false))
      .then(() => b.run('main.ts', 'main.js', true))
      .then(() => {
        electron.start();
        srcWatcher.on('change', (file, stats) => {
          let ext: string = path.extname(file);
          let basename: string = path.basename(file);
          console.log(chalk.blue(`${basename} changed...`));
          switch (ext) {
            case '.ts':
              b.run('main.ts', 'main.js', true).then(() => {
                electron.reload();
              }).catch(err => printError(err));
              break;
            case '.sass':
              generateCSS().then(() => {
                electron.reload();
              }).catch(err => printError(err));
              break;
            case '.html':
              if (basename === 'index_dev.html') {
                generateIndexHtml('index_dev.html').then(() => {
                  electron.reload();
                }).catch(err => printError(err));
              } else {
                b.cache = null;
                b.run('main.ts', 'main.js', true).then(() => {
                  electron.reload();
                }).catch(err => printError(err));
              }
              break;
            }
          });
        })
        .catch(err => {
          printError(err);
        });
    });
  });
}

function build(): Promise<null> {
  return generateIndexHtml('index_prod.html')
    .then(() => generateCSS())
    .then(() => generatePackageJson())
    .then(() => copyAssets())
    .then(() => b.run('electron.ts', 'electron.js', false))
    .then(() => b.run('main.ts', 'main.js', true))
    .then(() => {
      console.log(`${chalk.green('✔')} Project successfully generated.`);
    })
    .catch(err => {
      throw new Error(err);
    });
}

function makeApp(): Promise<null> {
  return build()
    .then(() => makePackages())
    .then(() => {
      console.log(`${chalk.green('✔')} Done.`)
    })
    .catch(err => {
      throw new Error(err);
    });
}

let arg = process.argv.slice(2)[0];

if (arg === 'dev') {
  dev();
} else if (arg === 'build') {
  build();
} else if (arg === 'app') {
  makeApp();
}
