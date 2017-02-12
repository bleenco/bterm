import { Injectable, Provider, Inject } from '@angular/core';
import { HtermService, Terminal } from './hterm.service';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
  homeDir: string;
  configPath: string;
  config: any;

  constructor(@Inject(HtermService) private hterm: HtermService) {
    this.homeDir = os.homedir();
    this.configPath = `${this.homeDir}/.speedterm.json`;
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  setConfig(): void {
    let doc: HTMLElement = document.documentElement;
    let terminal: HTMLElement = doc.querySelector('.window-terminal') as HTMLElement;
    let topBar: HTMLElement = doc.querySelector('.window-top-container') as HTMLElement;
    let bottomBar: HTMLElement = doc.querySelector('.window-bottom-container') as HTMLElement;

    this.hterm.terminals.forEach((term: Terminal) => {
      term.term.prefs_.set('font-family', this.config.style.font);
      term.term.prefs_.set('font-size', this.config.style.font_size);
      term.term.prefs_.set('background-color', this.config.style.background);
      term.term.prefs_.set('foreground-color', this.config.style.color);
      term.term.prefs_.set('cursor-color', this.config.style.cursor);
      term.term.prefs_.set('color-palette-overrides', this.config.style.colors);

      let el = term.el as HTMLElement;
      el.style.background = this.config.style.background;
      if (term.active) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    doc.style.fontFamily = this.config.style.font;
    doc.style.fontSize = this.config.style.font_size;
    terminal.style.background = this.config.style.background;
    topBar.style.background = this.config.style['top_bar_background'];
    bottomBar.style.background = this.config.style['bottom_bar_background'];
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
