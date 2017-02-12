import * as path from 'path';
import * as chalk from 'chalk';
import { getConfig } from './config';

const rollup = require('rollup');
const angular = require('rollup-plugin-angular');
const tsr = require('rollup-plugin-typescript');
const progress = require('rollup-plugin-progress');

export class Build {
  cache: any;
  building: boolean;
  config: any;

  constructor() {
    this.config = getConfig();
    this.building = false;
  }

  run(entry: string, dest: string, cache: boolean): Promise<null> {
    return new Promise((resolve, reject) => {
      entry = path.resolve(__dirname, `../src/${entry}`);
      dest = path.resolve(__dirname, `../dist/${dest}`);
      let start: Date = new Date();
      rollup.rollup({
        entry: entry,
        cache: cache ? this.cache : null,
        context: 'this',
        plugins: [
          angular(),
          tsr({ typescript: require(path.resolve(__dirname, '../node_modules/typescript/')) }),
          progress()
        ],
        external: Object.keys(this.config.externalPackages)
      }).then(bundle => {
        this.cache = bundle;
        return bundle.write({
          format: 'cjs',
          dest: dest,
          sourceMap: true,
          globals: this.config.externalPackages
        }).then(() => {
          let time = new Date().getTime() - start.getTime();
          console.log(`${chalk.green('✔')} Build successful in ${time}ms`);
          resolve();
        });
      })
      .catch(err => {
        reject(err);
      });
    });
  }
}
