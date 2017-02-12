import { Injectable, Provider, EventEmitter, Inject } from '@angular/core';
import { PTYService, Process } from './pty.service';
let electron = require('electron');
let { ipcRenderer } = electron;
import * as hterm from 'hterm';

export interface Terminal {
  el: HTMLElement,
  storage: any,
  term: any,
  input: EventEmitter<string>,
  output: EventEmitter<string>,
  active: boolean,
  ps?: Process,
};

@Injectable()
export class HtermService {
  terminals: Terminal[];
  outputEvents: EventEmitter<{ action: string, data: number | null }>;
  currentIndex: number;

  constructor(@Inject(PTYService) private pty: PTYService) {
    this.terminals = [];
    this.outputEvents = new EventEmitter<{ action: string, data: number | null }>();
    hterm.hterm.defaultStorage = new hterm.lib.Storage.Local();
    hterm.hterm.Terminal.prototype.overlaySize = () => {};
  }

  create(): void {
    let doc: HTMLDocument = document;
    let container: HTMLElement = doc.querySelector('.window-terminal-container') as HTMLElement;
    let el: HTMLElement = doc.createElement('div');
    el.classList.add('terminal-instance');
    container.appendChild(el);

    this.terminals.forEach((term: Terminal) => term.active = false);

    let terminal: Terminal = {
      el: el,
      storage: new hterm.lib.Storage.Local(),
      term: new hterm.hterm.Terminal(),
      input: new EventEmitter<string>(),
      output: new EventEmitter<string>(),
      active: true
    };

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

    terminal.term.onTerminalReady = () => {
      this.initializeInstance(terminal, el);
      this.initializeProcess(terminal);
    };

    this.terminals.push(terminal);
    this.outputEvents.emit({ action: 'created', data: null });
    this.currentIndex = this.terminals.length - 1;
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
    }

    terminal.input.subscribe((str: string) => {
      requestAnimationFrame(() => terminal.term.io.writeUTF8(str.toString()));
    });
  }

  initializeProcess(terminal: Terminal): void {
    terminal.ps = this.pty.create();
    terminal.ps.output.subscribe((str: string) => terminal.input.emit(str));
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

    setTimeout(() => {
      let nodes = [...Array(terminal.term.getRowCount()).keys()].map(i => terminal.term.getRowNode(i));
      nodes = nodes.map((node: Node) => {
        let matches = node.firstChild.textContent.match(/jan/ig);
        if (!matches) {
          return node;
        }

        matches.forEach(match => {
          let elHtml = `<span class="found" style="background: #FFFF00; color: #111111; border-radius: 1px;">${match}</span>`
          node.firstChild.parentElement.innerHTML = node.firstChild.textContent.replace(match, elHtml);
        });

        return node;
      });

      let t = terminal.term;
      t.scrollbackRows_ = nodes.splice(0, t.scrollbackRows_.length);
      t.screen_.rowsArray = nodes;
      t.scrollPort_.invalidate();
      // t.scrollPort_.scrollRowToTop(0);

      setTimeout(() => {
        nodes = [...Array(terminal.term.getRowCount()).keys()].map(i => terminal.term.getRowNode(i));
        nodes = nodes.map((node: Node) => {
          node.textContent = node.textContent.replace(/<span class="found"(.*)">(.*)<\/span>/ig, '$2');
          return node;
        });

        t.scrollbackRows_ = nodes.splice(0, t.scrollbackRows_.length);
        t.screen_.rowsArray = nodes;
        t.scrollPort_.invalidate();

        console.log('done.');
      }, 2000);

    }, 3000);
  }

  switchTab(index: number): void {
    if (index > this.terminals.length - 1) { return; }
    this.terminals.forEach((term: Terminal) => term.active = false);
    this.terminals[index].active = true;
    this.terminals[index].el.focus();
    this.outputEvents.emit({ action: 'switch', data: index });
    this.currentIndex = index;
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
    this.terminals[this.currentIndex].el.focus();
  }
}

export let HtermServiceProvider: Provider = {
  provide: HtermService, useClass: HtermService
};
