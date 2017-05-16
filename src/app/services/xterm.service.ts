import { Injectable, Provider, EventEmitter, Inject, NgZone } from '@angular/core';
import { PTYService, Process } from './pty.service';
let electron = require('electron');
let { ipcRenderer } = electron;
let XTerminal = require('xterm');
import { platform } from 'os';

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
export class XtermService {
  terminals: Terminal[];
  outputEvents: EventEmitter<{ action: string, data: number | null }>;
  titleEvents: EventEmitter<{ index: number, title: string }>;
  resizeEvents: EventEmitter<IResizeGeom>;
  currentIndex: number;
  osPlatform: string;

  constructor(@Inject(PTYService) private pty: PTYService, @Inject(NgZone) private zone: NgZone) {
    this.terminals = [];
    this.outputEvents = new EventEmitter<{ action: string, data: number | null }>();
    this.titleEvents = new EventEmitter<{ index: number, title: string }>();
    this.resizeEvents = new EventEmitter<IResizeGeom>();
    // hterm.hterm.defaultStorage = new hterm.lib.Storage.Local();
    // hterm.hterm.Terminal.prototype.overlaySize = () => {};
    // this.fixKeyboard();
    this.osPlatform = platform();
  }

  create(): void {
    let doc: HTMLDocument = document;
    let container: HTMLElement = doc.querySelector('.window-terminal-container') as HTMLElement;
    let el: HTMLElement = doc.createElement('div');
    el.classList.add('terminal-instance');
    container.appendChild(el);

    this.terminals.forEach((term: Terminal) => term.active = false);

    XTerminal.loadAddon('fit');
    let terminal: Terminal = {
      el: el,
      storage: null,
     // storage: new hterm.lib.Storage.Local(),
      term: new XTerminal({ scrollback: 1000 }), // TODO: Get from config
      input: new EventEmitter<string>(),
      output: new EventEmitter<string>(),
      active: true,
      title: '',
      dir: ''
    };

/*
    terminal.term.decorate(el);
    terminal.term.prefs_.storage.clear();
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
*/

    terminal.term.on('open', () => {
      this.initializeInstance(terminal, el);
      this.initializeProcess(terminal);
      this.terminals.push(terminal);
      this.outputEvents.emit({ action: 'created', data: null });
      this.currentIndex = this.terminals.length - 1;
      this.focusCurrent();
    });


    setTimeout(() => terminal.term.open(terminal.el, true));
  }

  deleteTab(): void {
    this.terminals[this.currentIndex].ps.exit.emit(true);
  }

  clearTab(): void {
    let termOutput = this.terminals[this.currentIndex].output;
    this.osPlatform === 'win32' ? termOutput.emit('\n cls \n') : termOutput.emit('\n clear \n');
  }

  initializeInstance(terminal: Terminal, el: HTMLElement): void {
    terminal.term.on('key', (str: string) => terminal.output.emit(str));

    terminal.term.on('resize', (size) => {
      terminal.ps.resize.emit({ col: size.cols, row: size.rows });
      this.resizeEvents.emit({ col: size.cols, row: size.rows });
    });

    terminal.input.subscribe((str: string) => {
      requestAnimationFrame(() => this.write(str, terminal));
    });
  }

  initializeProcess(terminal: Terminal): void {
    terminal.ps = this.pty.create();
    terminal.ps.output.subscribe((str: string) => { terminal.term.write(str); terminal.term.fit(); });
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
        this.outputEvents.emit({ action: 'closed', data: idx });
        this.currentIndex = idx;
      }
    });

    terminal.output.subscribe((str: string) => terminal.ps.input.emit(str));

    terminal.term.on('title', (title: string) => {
      title = title.trim();
      try {
        let splitted = title.split(':');
        terminal.title = splitted[0].trim();
        terminal.dir = splitted[1].trim();
      } catch (e) {
        terminal.title = title;
      }

      let index = this.terminals.findIndex(t => t.term === terminal.term);
      this.titleEvents.emit({ index: index, title: title });
    });

    this.focusCurrent();
  }

  write(str: string, terminal: Terminal): void {
    terminal.term.write(str.toString());
  }

  fitTerminal() {
    // let newGeom: IResizeGeom = { col: Math.floor(geomInPx.col/25), row: Math.floor(geomInPx.row/25) };
    this.terminals.forEach( (terminal: Terminal) => { terminal.term.fit(); }); // resize(newGeom.col, newGeom.row); });
    this.focusCurrent();
  }

  switchTab(index: number): void {
    if (index > this.terminals.length - 1) { return; }
    this.terminals.forEach((term: Terminal) => term.active = false);
    this.terminals[index].active = true;
    this.outputEvents.emit({ action: 'switch', data: index });
    this.currentIndex = index;
    this.focusCurrent();
    this.titleEvents.emit({ index: this.currentIndex,
      title: this.terminals[this.currentIndex].title + ':' + this.terminals[this.currentIndex].dir });
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

export let XtermServiceProvider: Provider = {
  provide: XtermService, useClass: XtermService
};
