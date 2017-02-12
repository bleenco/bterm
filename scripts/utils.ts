import * as fs from 'fs-extra';
import * as path from 'path';
import * as sass from 'node-sass';
import * as chalk from 'chalk';

export function generateIndexHtml(srcFile: string): Promise<null> {
  return new Promise((resolve, reject) => {
    let src = path.resolve(__dirname, `../src/${srcFile}`);
    let dest = path.resolve(__dirname, `../dist/index.html`);
    fs.copy(src, dest, (err: Error) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function generateCSS(): Promise<null> {
  return new Promise((resolve, reject) => {
    let src = path.resolve(__dirname, '../src/styles/app.sass');
    let dest = path.resolve(__dirname, '../dist/app.css');
    let start: Date = new Date();
    sass.render({ file: src, outputStyle: 'compressed' }, (err: Error, result: any) => {
      if (err) {
        reject(err);
      }
      fs.writeFile(dest, result.css, (writeErr: Error) => {
        if (writeErr) {
          reject(writeErr);
        }
        let time = new Date().getTime() - start.getTime();
        console.log(`${chalk.green('✔')} SASS compiled in ${time}ms`);
        resolve();
      });
    });
  });
}

export function generatePackageJson(): Promise<null> {
  return new Promise((resolve, reject) => {
    let pkgJson: any = fs.readJsonSync(path.resolve(__dirname, '../package.json'));
    let productPkgJson: any = {
      name: pkgJson.name,
      description: pkgJson.description,
      author: pkgJson.author,
      version: pkgJson.version,
      main: 'electron.js',
      dependencies: pkgJson.dependencies
    };

    fs.writeJson(path.resolve(__dirname, '../dist/package.json'), productPkgJson, err => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function copyAssets(): Promise<null> {
  return new Promise((resolve, reject) => {
    let publicDir: string = path.resolve(__dirname, '../assets');
    let destDir: string = path.resolve(__dirname, '../dist/assets');
    fs.copy(publicDir, destDir, (err: Error) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function printError(err: string) {
  console.log(chalk.red('✖'), err);
}
