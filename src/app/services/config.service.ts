import { Injectable, Provider } from '@angular/core';
import { Terminal } from './xterm.service';
import * as os from 'os';
import * as fs from 'fs';
import { CssBuilder } from '../../utils';

export interface IShellDef {
  shell: string;
  args: string[];
};

@Injectable()
export class ConfigService {
  homeDir: string;
  configPath: string;
  config: any;
  watcher: any;
  css: CssBuilder;
  terminals: Terminal[];
  defaultShell: IShellDef;

  constructor() {
    this.defaultShell = null;
    this.terminals = [];
    this.css = new CssBuilder();
    this.homeDir = os.homedir();
    this.configPath = `${this.homeDir}/.bterm.json`;
    let user = os.userInfo({ encoding: 'utf8' });

    if (!fs.existsSync(this.configPath)) {
      this.recovery();
    }

    this.readConfig();
    this.updateShell();
    this.setWatcher();

    if (!this.shell) {
      switch (os.platform()) {
        case 'win32': this.shell = { shell: 'cmd.exe', args: [] }; break;
        case 'darwin': this.shell = { shell: 'login', args: ['-fp', user.username] }; break;
        case 'linux': this.shell = { shell: '/bin/bash', args: [] }; break;
      }
    }
  }

  get shell(): IShellDef { return this.defaultShell; }
  set shell(sh: IShellDef) { this.defaultShell = sh; }

  setTerminals(terminals: Terminal[]) { this.terminals = terminals; this.decorateTerminals(); }

  decorateTerminals() {
    this.terminals.forEach((term: Terminal) => {
      let el = term.el as HTMLElement;
      el.style.background = this.config.style.background;
      if (term.active) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }

      setTimeout(() => {
        term.term.fit();
        if (term.active) { term.term.focus(); }
      });
    });
  }

  updateShell() {
    if (this.config.settings.shell && this.config.settings.shell.shell && this.config.settings.shell.args) {
      this.shell = this.config.settings['shell'];
    }
  }

  setConfig(): void {
    let doc: HTMLElement = document.documentElement;
    let terminal: HTMLElement = doc.querySelector('.window-terminal') as HTMLElement;
    let topBar: HTMLElement = doc.querySelector('.window-top-container') as HTMLElement;
    let bottomBar: HTMLElement = doc.querySelector('.window-bottom-container') as HTMLElement;
    let sidebar: HTMLElement = doc.querySelector('.sidebar') as HTMLElement;

    this.updateShell();
    this.css.clear();

    this.config.style.colors.reverse().forEach( (color: string, index: number) => {
      this.css.add(`.xterm-color-${index + 1}`, `color: ${color};`);
    });

    this.css.add('.terminal-cursor', `background: ${this.config.style.cursor} !important; color: ${this.config.style.cursor} !important;`);
    this.css.add('.terminal-instance .active', `font-size: ${this.config.settings.font_size}px !important;`);
    this.css.add('.xterm-rows', `color: ${this.config.style.color} !important; font-family: ${this.config.settings.font} !important;`);
    this.css.add('.close-tab-fill', `fill: ${this.config.style.color} !important;`);
    this.css.add('.close-tab-fill:hover', `fill: ${this.config.style.colors[3]} !important;`);
    this.css.add('.theme-fg-color', `color: ${this.config.style.color} !important;`);
    this.css.add('.theme-bg-color', `color: ${this.config.style.background} !important;`);

    this.css.inject();

    terminal.style.padding = this.config.settings.windowPadding;

    doc.style.fontFamily = this.config.settings.font;
    doc.style.fontSize = this.config.settings.font_size + 'px';
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

    this.decorateTerminals();
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
        'clipboard_notice': false,
        'theme_name': 'AtelierSulphurpool',
        'scrollBufferSave': false
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
      updateServer: {
        url: 'dl.bleenco.io',
        protocol: 'https://',
        path: '/update'
      }
    };

    return defaultConfig;
  }

  recovery(): void {
    let defaultConfig = this.getDefaultConfig();
    fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf8' });
  }

  previewTheme(styles: any, theme: string): void {
    let config = Object.assign({}, this.getDefaultConfig(), styles);
    config.settings.theme_name  = theme;
    this.config = config;
    this.setConfig();
    this.writeConfig();
  }

  getUpdateServer(): string {
    return 'https://dl.bleenco.io/update';
  }

  writeConfig(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
