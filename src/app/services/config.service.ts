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

        text.style.fontSize = this.config.settings.font_size;
        icon.style.fontSize = this.config.settings.font_size;

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
        'font_size': '12',
        'font_smoothing': 'subpixel-antialiased',
        'cursor_blink': false,
        'windowPadding': '0 10px',
        'clipboard_notice': false
      },
      'style': {
        'background': '#111111',
        'color': '#c5c8c6',
        'cursor': '#c5c8c6',
        'top_bar_background': '#111111',
        'top_bar_tab_color': '#4A4F5B',
        'top_bar_tab_active_color': '#62C655',
        'bottom_bar_background': '#111111',
        'colors': [
          '#282a2e', '#a54242', '#8c9440',
          '#de935f', '#5f819d', '#85678f',
          '#5e8d87', '#707880', '#373b41',
          '#cc6666', '#b5bd68', '#f0c674',
          '#81a2be', '#b294bb', '#8abeb7',
          '#c5c8c6'
        ]
      }
    };

    fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf8' });
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
