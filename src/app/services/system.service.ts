import { Injectable, Inject, Provider } from '@angular/core';
import { ConfigService } from './config.service';
import * as path from 'path';

let fontManager = require('font-manager');
import { which } from 'shelljs';

export interface IFonts {
  family: string;
  toString?: () => string;
};

export interface IUrlKeys {
  key: string;
  toString?: () => string;
}

@Injectable()
export class SystemService {
  fonts: IFonts[];
  shells: { shell: string, args: string[] }[];

  constructor(@Inject(ConfigService) private _config: ConfigService) {
    this.fonts = [];
    this.shells = [];
  }

  getFonts() {
    if (this.fonts.length) { return Promise.resolve(this.fonts); }

    return new Promise<IFonts[]>(resolve => {
      fontManager.findFonts({ monospace: true }, result => {
        result = result.map(r => ({ family: r.family, toString: function() { return this.family }}));
        this.fonts = result;
        resolve(this.fonts);
      });
    });
  }

  getShells(): Promise<{ shell: string, args: string[] }[]> {
    if (this.shells.length) { return Promise.resolve(this.shells); }

    return new Promise(resolve =>  {
      if (!this._config.config.settings.shells) {
        resolve([]);
      }

      this._config.config.settings.shells.forEach((s: string) => {
        const foundShell: any = which(s);
        if (foundShell) {
          this.shells.push({ shell: foundShell.toString(), args: [] });
        }
      });

      resolve(this.shells);
    });
  }

  getUrlKeys(): IUrlKeys[] {
    return [
      { key: 'ctrl', toString: function() { return this.key.toUpperCase(); } },
      { key: 'shift', toString: function() { return this.key.toUpperCase(); } },
      { key: 'meta', toString: function() { return this.key.toUpperCase(); } }
    ];
  }

}

export let SystemServiceProvider: Provider = {
  provide: SystemService,
  useClass: SystemService
};
