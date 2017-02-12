import * as fs from 'fs-extra';
import * as path from 'path';

export function getConfig(): any {
  return fs.readJsonSync(path.resolve(__dirname, '../config.json'));
}

export function getPackageJson(): any {
  return fs.readJsonSync(path.resolve(__dirname, '../package.json'));
}
