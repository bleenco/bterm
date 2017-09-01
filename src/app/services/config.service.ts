import { Injectable, Provider } from '@angular/core';
import { Terminal } from './hterm.service';
import * as os from 'os';
import * as fs from 'fs';
import { join } from 'path';
import { CssBuilder } from '../../utils';
import { IUrlKeys, IFonts } from './system.service';
import { execSync } from 'child_process';
import { which } from 'shelljs';

@Injectable()
export class ConfigService {
  homeDir: string;
  configPath: string;
  config: any;
  watcher: any;
  css: CssBuilder;
  terminals: Terminal[];

  constructor() {
    this.terminals = [];
    this.css = new CssBuilder();
    this.homeDir = os.homedir();
    this.configPath = `${this.homeDir}/.bterm.json`;

    if (!fs.existsSync(this.configPath)) {
      this.recovery();
    }

    this.writePS1();
    this.readConfig();
    this.setWatcher();
  }

  setTerminals(terminals: Terminal[]) {
    this.terminals = terminals;
    this.decorateTerminals();
  }

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
        if (term.active) { term.term.focus(); }
      });
    });
  }

  getDefaultShell(): { shell: string, args: string } {
    const cmdRegex = /cmd.exe/;
    const shRegex = /sh$/;
    let shell = null;
    let args = null;

    if (this.config.settings.shell) {
      return this.config.settings.shell;
    } else {
      const exec = execSync('echo $SHELL', { encoding: 'utf8' }).toString();
      if (exec && exec.includes('bin')) {
        shell = exec.trim();
      } else {
        if (os.platform() === 'darwin') {
          shell = process.env.SHELL || '/bin/bash';
        } else if (os.platform() === 'win32') {
          const bashPath: any = which('bash');
          if (bashPath.code === 0 && bashPath.stdout) {
            shell = bashPath.stdout;
          } else {
            shell = process.env.SHELL || process.env.COMSPEC || 'cmd.exe';
          }
        } else {
          shell = process.env.SHELL || '/bin/sh';
        }
      }

      if (process.env.SHELL_EXECUTE_FLAGS) {
        args = process.env.SHELL_EXECUTE_FLAGS;
      } else {
        args = '';
      }

      return { shell: shell, args: args.split(' ').filter(Boolean) };
    }
  }

  setConfig(): void {
    let doc: HTMLElement = document.documentElement;
    let terminal: HTMLElement = doc.querySelector('.window-terminal') as HTMLElement;
    let topBar: HTMLElement = doc.querySelector('.window-top-container') as HTMLElement;
    let bottomBar: HTMLElement = doc.querySelector('.window-bottom-container') as HTMLElement;
    let sidebar: HTMLElement = doc.querySelector('.sidebar') as HTMLElement;

    this.css.clear();

    this.config.style.colors.forEach( (color: string, index: number) => {
      this.css.add(`.xterm-color-${index}`, `color: ${color} !important;`);
    });

    if (!this.config.settings.urlKey) { this.config.settings['urlKey'] = 'shift'; }

    this.css.add('html', `background: ${this.config.style.background} !important;`);
    this.css.add('.terminal-cursor', `background: ${this.config.style.cursor} !important; color: ${this.config.style.cursor} !important;`);
    this.css.add('.terminal-instance .active', `font-size: ${this.config.settings.font.size}px !important;`);
    this.css.add('.close-tab-fill', `fill: ${this.config.style.color} !important;`);
    this.css.add('.close-tab-fill:hover', `fill: ${this.config.style.colors[3]} !important;`);
    this.css.add('.theme-fg-color', `color: ${this.config.style.color} !important;`);
    this.css.add('.theme-bg-color', `color: ${this.config.style.background} !important;`);
    this.css.add('.theme-bg', `background-color: ${this.config.style.background} !important;`);
    this.css.add('.theme-fg', `background-color: ${this.config.style.color} !important;`);
    this.css.add('.theme-fg-fill', `fill: ${this.config.style.color} !important;`);

    this.css.inject();

    terminal.style.padding = this.config.settings.windowPadding;

    doc.style.fontFamily = this.config.settings.font.family;
    doc.style.fontSize = this.config.settings.font.size + 'px';
    terminal.style.background = this.config.style.background;
    topBar.style.background = this.config.style['top_bar_background'];
    bottomBar.style.background = this.config.style['bottom_bar_background'];
    sidebar.style.background = this.config.style.background;

    topBar.style.font =  this.config.settings.font.family;
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

  updateConfig() {
    this.writeConfig();
    this.setConfig();
  }

  setFont(font: IFonts) {
    if (this.config && this.config.settings) {
      this.config.settings['font'] = { family: font.family, size: this.config.settings.font.size || '13' };
    }
    this.updateConfig();
  }

  setShell(shell: { shell: string, args: string[] }) {
    if (this.config && this.config.settings) {
      this.config.settings.shell = shell;
      this.updateConfig();
    }
  }

  setUrlKey(urlkey: IUrlKeys) {
    if (this.config && this.config.settings) { this.config.settings['urlKey'] = urlkey.key; }
    this.updateConfig();
  }

  setSidebarConfig(): void {
    setTimeout(() => {
      let doc: HTMLElement = document.documentElement;
      let sidebar: HTMLElement = doc.querySelector('.sidebar') as HTMLElement;

      [].forEach.call(sidebar.querySelectorAll('.menu-open path'), dot => dot.style.fill = this.config.style.color);
      let closeIcon = sidebar.querySelector('.close-icon > svg > path') as SVGPathElement;
      let sideBarHeading = sidebar.querySelector('.sidebar h1') as HTMLElement;

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

    return this.config;
  }

  readConfig(): void {
    this.config = Object.assign({}, this.getDefaultConfig(), JSON.parse(fs.readFileSync(this.configPath, 'utf8')));
  }

  getDefaultConfig(): any {
    let defaultConfig = {
      'settings': {
        'font': {
          'family': 'RobotoMono',
          'size': '12'
        },
        'font_smoothing': 'antialiased',
        'cursor_blink': false,
        'windowPadding': '10px 10px 0px 10px',
        'clipboard_notice': false,
        'theme_name': 'bterm default',
        'scrollBufferSave': false,
        'shells': [ 'bash', 'zsh', 'sh', 'powershell', 'cmd', 'login', 'tcsh', 'csh', 'ash' ],
        'urlKey': 'shift'
      },
      'style': {
        'background': '#1E2B36',
        'color': '#f8f8f2',
        'cursor': '#f8f8f2',
        'top_bar_background': '#283642',
        'top_bar_tab_color': '#283642',
        'top_bar_tab_active_color': '#a5a2a2',
        'bottom_bar_background': '#1E2B36',
        'colors': [
          '#283642',
          '#FF3055',
          '#50fa7b',
          '#f1fa8c',
          '#bd93f9',
          '#ff79c6',
          '#3AB1E9',
          '#bbbbbb',
          '#555555',
          '#FF3055',
          '#50fa7b',
          '#f1fa8c',
          '#bd93f9',
          '#ff79c6',
          '#3AB1E9',
          '#ffffff'
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

  writePS1(): void {
    try {
      const bashrcPath = join(os.homedir(), '.bashrc');
      const contents = fs.readFileSync(bashrcPath).toString();
      let found: boolean;

      let splitted = contents.split('\n');
      splitted = splitted.map(line => {
        if (line.includes('PS1=') && !line.includes('\\[\\033]0;\\w\\007\\]')) {
          found = true;
          line = line.replace(/PS1=['"](.*)['"]/g, 'PS1="\\[\\033]0;\\w\\007\\]$1"');
        }

        if (line.includes('\\[\\033]0;\\w\\007\\]')) {
          found = true;
        }

        return line;
      });

      if (!found) {
        splitted.push('PS1="\\[\\033]0;\\w\\007\\]> "');
      }

      fs.writeFileSync(bashrcPath, splitted.join('\n'), 'utf8');
    } catch (e) {
      console.log('.bashrc not found, ignoring...');
    }
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
