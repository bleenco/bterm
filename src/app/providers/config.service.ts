import { Injectable, EventEmitter } from '@angular/core';
import { homedir } from 'os';
import { existsSync, writeFileSync, readFileSync, watchFile } from 'fs';
import { ITheme } from 'xterm';

export interface BtermConfig {
  fontFamily: string;
  fontSize: number;
  baseTheme: 'light' | 'dark';
  themeOverrides: ITheme;
  borderColor: string;
}

export interface ParsedConfig {
  fontFamily: string;
  fontSize: number;
  borderColor: string;
  colors: {
    foreground?: string;
    background?: string;
    cursor?: string;
    cursorAccent?: string;
    selection?: string;
    black?: string;
    red?: string;
    green?: string;
    yellow?: string;
    blue?: string;
    magenta?: string;
    cyan?: string;
    white?: string;
    brightRed?: string;
    brightGreen?: string;
    brightYellow?: string;
    brightBlue?: string;
    brightMagenta?: string;
    brightCyan?: string;
    brightWhite?: string;
  };
}

@Injectable()
export class ConfigService {
  home: string;
  configPath: string;
  lightTheme: ITheme;
  darkTheme: ITheme;
  configEvents: EventEmitter<ParsedConfig>;

  body: HTMLBodyElement;

  constructor() {
    this.home = homedir();
    this.configPath = this.home + '/.bterm2.json';
    this.configEvents = new EventEmitter<ParsedConfig>();

    this.lightTheme = {
      foreground: '#000000',
      background: '#ffffff',
      cursor: '#000000',
      cursorAccent: '#000000',
      selection: 'rgba(0, 0, 0, 0.1)',
      black: '#000000',
      red: '#de3e35',
      green: '#3f953a',
      yellow: '#d2b67c',
      blue: '#2f5af3',
      magenta: '#950095',
      cyan: '#3f953a',
      white: '#bbbbbb',
      brightBlack: '#000000',
      brightRed: '#de3e35',
      brightGreen: '#3f953a',
      brightYellow: '#d2b67c',
      brightBlue: '#2f5af3',
      brightMagenta: '#a00095',
      brightCyan: '#3f953a',
      brightWhite: '#ffffff'
    };

    this.darkTheme = {
      foreground: '#F8F8F2',
      background: '#090E15',
      cursor: '#bd93f9',
      cursorAccent: '#bd93f9',
      selection: 'rgba(241, 250, 140, 0.3)',
      black: '#090E15',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#96ECFD',
      magenta: '#bd93f9',
      cyan: '#8be9fd',
      white: '#ffffff',
      brightBlack: '#090E15',
      brightRed: '#ff5555',
      brightGreen: '#50fa7b',
      brightYellow: '#f1fa8c',
      brightBlue: '#96ECFD',
      brightMagenta: '#bd93f9',
      brightCyan: '#8be9fd',
      brightWhite: '#ffffff'
    };

    if (!existsSync(this.configPath)) {
      this.writeConfig(this.defaultConfig());
    }
  }

  initWatcher(): void {
    watchFile(this.configPath, () => {
      if (!existsSync(this.configPath)) {
        this.writeConfig(this.defaultConfig());
      }

      this.getConfig();
    });
  }

  getConfig(): void {
    const btermConfig = this.readConfig();
    const parsedConfig: ParsedConfig = {
      fontFamily: btermConfig.fontFamily,
      fontSize: btermConfig.fontSize,
      borderColor: btermConfig.borderColor,
      colors: Object.assign({}, btermConfig.baseTheme === 'light' ? this.lightTheme : this.darkTheme, btermConfig.themeOverrides);
    }

    this.configEvents.emit(parsedConfig);
  }

  defaultConfig(): BtermConfig {
    return {
      fontFamily: 'Monaco, Menlo, \'DejaVu Sans Mono\', \'Ubuntu Mono\', monospace',
      fontSize: 12,
      baseTheme: 'dark',
      themeOverrides: {},
      borderColor: '#333333'
    };
  }

  readConfig(): BtermConfig {
    return JSON.parse(readFileSync(this.configPath, { encoding: 'utf8' }));
  }

  writeConfig(config: BtermConfig): void {
    writeFileSync(this.configPath, JSON.stringify(config, null, 2), { encoding: 'utf8' });
  }
}
