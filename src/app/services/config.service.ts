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
    this.configPath = `${this.homeDir}/.bterm.json`;

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
    let sidebar: HTMLElement = doc.querySelector('.sidebar') as HTMLElement;

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
    sidebar.style.background = this.config.style.background;

    topBar.style.font = this.config.style.font;
    [].forEach.call(topBar.querySelectorAll('.title'), title => {
      title.style.color = this.config.style.color;
    });

    setTimeout(() => {
      let folderIcon = bottomBar.querySelector('.icon-folder > svg > path') as SVGPathElement;
      let folderText = bottomBar.querySelector('.current-folder-text') as HTMLElement;

      if (folderIcon) {
        folderIcon.style.fill = this.config.style.color;
        folderIcon.style.stroke = this.config.style.color;
        folderIcon.style.strokeWidth = '1';
      }

      if (folderText) {
        folderText.style.color = this.config.style.color;
      }

      this.setSidebarConfig();
    }, 1000);

    this.writeConfig();
  }

  setSidebarConfig(): void {
    setTimeout(() => {
      let doc: HTMLElement = document.documentElement;
      let sidebar: HTMLElement = doc.querySelector('.sidebar') as HTMLElement;

      [].forEach.call(sidebar.querySelectorAll('.menu-open path'), dot => dot.style.fill = this.config.style.color);
      let closeIcon = sidebar.querySelector('.close-icon > svg > path') as SVGPathElement;
      let sideBarHeading = sidebar.querySelector('.sidebar-container > h1') as HTMLElement;

      if (closeIcon) {
        closeIcon.style.fill = this.config.style.color;
      }

      if (sideBarHeading) {
        sideBarHeading.style.color = this.config.style.color;
      }

      setTimeout(() => {
        let themeBrowser = sidebar.querySelector('.theme-browser') as HTMLElement;
        if (themeBrowser) {
          let slimscrollGrid = sidebar.querySelector('.slimscroll-grid') as HTMLElement;
          let slimscrollBar = sidebar.querySelector('.slimscroll-bar') as HTMLElement;
          let themeSpans = sidebar.querySelectorAll('span');
          if (slimscrollGrid && slimscrollBar) {
            slimscrollGrid.style.background = this.config.style.color;
            slimscrollBar.style.background = this.config.style.color;
            [].forEach.call(themeSpans, span => {
              span.style.color = this.config.style.color;
            });
          }
        }
      });
    });
  }

  setWatcher(): void {
    this.readConfig();
    let config = JSON.stringify(this.config);

    this.watcher = fs.watchFile(this.configPath, () => {
      this.readConfig();
      let updatedConfig = JSON.stringify(this.config);
      if (config !== updatedConfig) {
        this.setConfig();
        config = updatedConfig;
      }
    });
  }

  readConfig(): void {
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  getDefaultConfig(): any {
    let defaultConfig = {
      'settings': {
        'font': 'monaco, Menlo, \'DejaVu Sans Mono\', \'Lucida Console\', monospace',
        'font_size': '13',
        'font_smoothing': 'subpixel-antialiased',
        'cursor_blink': false,
        'windowPadding': '20px 35px 10px 35px',
        'clipboard_notice': false
      },
      'style': {
        'background': '#090300',
        'color': '#a5a2a2',
        'cursor': '#F6C859',
        'top_bar_background': '#090300',
        'top_bar_tab_color': '#4C4B4B',
        'top_bar_tab_active_color': '#a5a2a2',
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
      },
      "updateServer": {
        "url": "dl.bleenco.io",
        "protocol": "https://",
        "path": "/update"
      }
    };

    return defaultConfig;
  }

  recovery(): void {
    let defaultConfig = this.getDefaultConfig();
    fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf8' });
  }

  previewTheme(styles: any): void {
    let config = Object.assign({}, this.getDefaultConfig(), styles);
    this.config = config;
    this.setConfig();
  }

  getUpdateServer(): string {
    return `${this.config.updateServer.protocol}${this.config.updateServer.url}${this.config.updateServer.path}`;
  }

  writeConfig(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
