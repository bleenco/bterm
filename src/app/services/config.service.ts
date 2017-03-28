import { Injectable, Provider, Inject } from '@angular/core';
import { HtermService, Terminal } from './hterm.service';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
  homeDir: string;
  configPath: string;
  config: any;
  watcher: any;

  constructor(@Inject(HtermService) private hterm: HtermService) {
    this.homeDir = os.homedir();
    this.configPath = `${this.homeDir}/.speedterm.json`;

    if (!fs.existsSync(this.configPath)) {
      this.recovery();
    }
    this.readConfig();
    this.setWatcher();
  }

  setConfig(): void {
    let doc: HTMLElement = document.documentElement;
    let terminal: HTMLElement = doc.querySelector('.window-terminal') as HTMLElement;
    let topBar: HTMLElement = doc.querySelector('.window-top-container') as HTMLElement;
    let bottomBar: HTMLElement = doc.querySelector('.window-bottom-container') as HTMLElement;

    this.hterm.terminals.forEach((term: Terminal) => {
      term.term.prefs_.set('font-family', this.config.settings.font);
      term.term.prefs_.set('font-size', this.config.settings.font_size);
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

    terminal.style.padding = this.config.settings.windowPadding;

    doc.style.fontFamily = this.config.style.font;
    doc.style.fontSize = this.config.style.font_size;
    terminal.style.background = this.config.style.background;
    topBar.style.background = this.config.style['top_bar_background'];
    bottomBar.style.background = this.config.style['bottom_bar_background'];

    setTimeout(() => {
      topBar.style.font = this.config.style.font;
      [].forEach.call(topBar.querySelectorAll('.tab'), (tab: HTMLElement) => {
        let icon = tab.querySelector('.icon') as HTMLElement;
        let text = tab.querySelector('.num') as HTMLElement;

        text.style.fontSize = '14px';
        icon.style.fontSize = '13px';

        if (tab.classList.contains('active')) {
          icon.style.color = this.config.style.top_bar_tab_active_color;
          text.style.color = this.config.style.top_bar_tab_active_color;
        } else {
          icon.style.color = this.config.style.top_bar_tab_color;
          text.style.color = this.config.style.top_bar_tab_color;
        }
      });
    });
  }

  setWatcher(): void {
    this.watcher = fs.watchFile(this.configPath, () => {
      this.readConfig();
      this.setConfig();
    });
  }

  readConfig(): void {
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  recovery(): void {
    let defaultConfig = {
      'settings': {
        'font': 'monaco, Menlo, \'DejaVu Sans Mono\', \'Lucida Console\', monospace',
        'font_size': '13',
        'font_smoothing': 'subpixel-antialiased',
        'cursor_blink': false,
        'windowPadding': '20px 35px',
        'clipboard_notice': false,

      },
      'style': {
        'background': '#090300',
        'color': '#a5a2a2',
        'cursor': '#a5a2a2',
        'top_bar_background': '#090300',
        'top_bar_tab_color': '#666666',
        'top_bar_tab_active_color': '#FFFFFF',
        'bottom_bar_background': '#090300',
        'colors': [
          '#090300',
          '#db2d20',
          '#01a252',
          '#fded02',
          '#01a0e4',
          '#a16a94',
          '#b5e4f4',
          '#a5a2a2',
          '#5c5855',
          '#db2d20',
          '#01a252',
          '#fded02',
          '#01a0e4',
          '#a16a94',
          '#b5e4f4',
          '#f7f7f7'
        ]
      }
    };

    fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf8' });
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
