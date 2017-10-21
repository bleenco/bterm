import { Injectable, Provider, EventEmitter, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PTYService, Process } from './pty.service';
import { ConfigService } from './config.service';
const electron = require('electron');
const { ipcRenderer, webFrame } = electron;
import { platform, homedir } from 'os';
import * as hterm from 'hterm-bundle';

export interface Terminal {
  el: HTMLElement,
  storage: any,
  term: any,
  input: EventEmitter<string>,
  output: EventEmitter<string>,
  active: boolean,
  ps?: Process,
  title: string,
  dir: string
};

export interface IResizeGeom {
  col: number;
  row: number;
};

@Injectable()
export class HtermService {
  terminals: Terminal[];
  outputEvents: EventEmitter<{ action: string, data: number | null }>;
  titleEvents: EventEmitter<{ index: number, title: string }>;
  resizeEvents: EventEmitter<IResizeGeom>;
  currentIndex: number;
  osPlatform: string;
  cwd: string;

  constructor(
    @Inject(PTYService) private pty: PTYService,
    @Inject(NgZone) private zone: NgZone,
    @Inject(DOCUMENT) private document: any,
    @Inject(ConfigService) private config: ConfigService
  ) {
    this.terminals = [];
    this.outputEvents = new EventEmitter<{ action: string, data: number | null }>();
    this.titleEvents = new EventEmitter<{ index: number, title: string }>();
    this.resizeEvents = new EventEmitter<IResizeGeom>();
    this.osPlatform = platform();
    this.fixKeyboard();
    hterm.hterm.defaultStorage = new hterm.lib.Storage.Local();
    hterm.hterm.Terminal.prototype.overlaySize = () => {};
  }

  create(): void {
    const doc: HTMLDocument = this.document;
    const container: HTMLElement = doc.querySelector('.window-terminal-container') as HTMLElement;
    const el: HTMLElement = doc.createElement('div');
    el.classList.add('terminal-instance', 'active');
    container.appendChild(el);

    this.terminals.forEach((term: Terminal) => {
      term.active = false
      term.el.classList.remove('active');
    });

    const terminal: Terminal = {
      el: el,
      storage: new hterm.lib.Storage.Local(),
      term: new hterm.hterm.Terminal(),
      input: new EventEmitter<string>(),
      output: new EventEmitter<string>(),
      active: true,
      title: '',
      dir: ''
    };

    terminal.term.prefs_.storage.clear();
    terminal.term.prefs_.set('audible-bell-sound', '');
    terminal.term.prefs_.set('font-smoothing', 'subpixel-antialiased');
    terminal.term.prefs_.set('enable-bold', false);
    terminal.term.prefs_.set('backspace-sends-backspace', true);
    terminal.term.prefs_.set('cursor-blink', false);
    terminal.term.prefs_.set('receive-encoding', 'raw');
    terminal.term.prefs_.set('send-encoding', 'raw');
    terminal.term.prefs_.set('alt-sends-what', 'browser-key');
    terminal.term.prefs_.set('scrollbar-visible', false);
    terminal.term.prefs_.set('enable-clipboard-notice', false);
    terminal.term.prefs_.set('background-color', 'transparent');
    terminal.term.prefs_.set('user-css', 'app.css');
    terminal.term.decorate(el);

    terminal.term.onTerminalReady = () => {
      this.initializeInstance(terminal, el);
      this.initializeProcess(terminal);
    }

    this.terminals.push(terminal);
    this.outputEvents.emit({ action: 'created', data: null });
    this.currentIndex = this.terminals.length - 1;
    this.focusCurrent();

    webFrame.setZoomFactor(1);
  }

  deleteTab(): void {
    this.terminals[this.currentIndex].ps.exit.emit(true);
  }

  deleteTabByIndex(index: number) {
    this.terminals[index].ps.exit.emit(true);
  }

  clearTab(): void {
    let termOutput = this.terminals[this.currentIndex].output;
    this.osPlatform === 'win32' ? termOutput.emit('\n cls \r\n') : termOutput.emit('\n clear \n');
  }

  initializeInstance(terminal: Terminal, el: HTMLElement): void {
    let io = terminal.term.io.push();
    terminal.term.keyboard.installKeyboard(el.querySelector('iframe').contentDocument);

    io.sendString = (str: string) => {
      terminal.output.emit(str);
    }

    io.onVTKeystroke = (str: string) => {
      terminal.output.emit(str.toString());
    }

    io.onTerminalResize = (col: number, row: number) => {
      terminal.ps.resize.emit({ col: col, row: row });
      this.resizeEvents.emit({ col: col, row: row });
    }

    terminal.input.subscribe((str: string) => {
      requestAnimationFrame(() => this.write(str, terminal));
    });
  }

  initializeProcess(terminal: Terminal): void {
    const cwd = this.cwd || homedir();
    terminal.ps = this.pty.create(cwd);

    terminal.ps.output.subscribe((str: string) => {
      terminal.input.emit(str);
    });

    terminal.ps.exit.subscribe((code: boolean) => {
      let el = terminal.el;
      let index = this.terminals.findIndex((term: Terminal) => term === terminal);
      this.terminals = this.terminals.filter((term: Terminal) => term !== terminal);
      el.parentNode.removeChild(el);
      if (!this.terminals.length) {
        ipcRenderer.send('closeApp');
      } else {
        let idx = (index - 1 > -1) ? index - 1 : 0;
        this.terminals[idx].active = true;
        this.terminals[idx].el.focus();
        this.terminals[idx].el.classList.add('active');
        this.outputEvents.emit({ action: 'closed', data: idx });
        this.currentIndex = idx;
      }
    });

    terminal.output.subscribe((str: string) => terminal.ps.input.emit(str));

    terminal.term.setWindowTitle = (title: string) => {
      title = title.trim();
      let index = this.terminals.findIndex(t => t.term === terminal.term);

      if (!title.startsWith('..')) {
        this.terminals[index].title = title;
        this.titleEvents.emit({ index: index, title: title });
      }
    };

    this.config.setTerminals(this.terminals);
    this.focusCurrent();
  }

  write(str: string, terminal: Terminal): void {
    if (terminal.term.vt.characterEncoding !== 'raw') {
      terminal.term.vt.characterEncoding = 'raw';
    }
    terminal.term.io.writeUTF8(str.toString());
  }

  fixKeyboard(): void {
    let that = this;
    let oldKeyDown = hterm.hterm.Keyboard.prototype.onKeyDown_;

    hterm.hterm.Keyboard.prototype.onKeyDown_ = function(e: KeyboardEvent) {
      if (e.key === 'Dead') {
        let idx = that.terminals.findIndex((term: Terminal) => !!term.active);
        let terminal = that.terminals[idx];

        switch (e.code) {
          case 'KeyN':
            terminal.output.emit('~');
            break;
          case 'IntlBackslash':
            terminal.output.emit('`');
            break;
          case 'Backslash':
            terminal.output.emit('`');
            break;
        }
      }

      return oldKeyDown.call(this, e);
    }
  }

  switchTab(index: number): void {
    if (index > this.terminals.length - 1) { return; }
    this.terminals.forEach((term: Terminal) => {
      term.active = false
      term.el.classList.remove('active');
    });
    this.terminals[index].active = true;
    this.terminals[index].el.classList.add('active');
    this.outputEvents.emit({ action: 'switch', data: index });
    this.currentIndex = index;
    this.focusCurrent();
    this.titleEvents.emit({ index: this.currentIndex, title: this.terminals[this.currentIndex].title });
  }

  switchPrev(): void {
    let index = this.currentIndex === 0 ? this.terminals.length - 1 : this.currentIndex - 1;
    this.switchTab(index);
  }

  switchNext(): void {
    let index = this.currentIndex === this.terminals.length - 1 ? 0 : this.currentIndex + 1;
    this.switchTab(index);
  }

  focusCurrent(): void {
    setTimeout(() => this.terminals[this.currentIndex].term.focus());
  }

}

export let HtermServiceProvider: Provider = {
  provide: HtermService, useClass: HtermService
};
