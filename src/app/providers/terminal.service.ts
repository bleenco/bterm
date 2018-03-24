import { Injectable, EventEmitter } from '@angular/core';
import { WindowService } from './window.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { timer } from 'rxjs/observable/timer';
import { map, share, filter, debounce } from 'rxjs/operators';
import * as os from 'os';
import { spawn } from 'node-pty';
import { Terminal, ITheme } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { execSync } from 'child_process';
import { which } from 'shelljs';
import { ipcRenderer } from 'electron';
import { StringDecoder } from 'string_decoder';

export interface PtyProcessType {
  shell: { shell: string, args: string[] };
  process: any;
  onData: Observable<string>;
  write: Subject<string>;
  writeSub: Subscription;
}

export interface TerminalType {
  el: HTMLElement;
  ptyProcess: PtyProcess;
  term: Terminal;
  title: string;
  subscriptions: Subscription[];
}

class PtyProcess implements PtyProcessType {
  shell: { shell: string, args: string[] };
  process: any;
  onData: Observable<string>;
  onError: Observable<string>;
  onExit: Observable<any>;
  write: Subject<string>;
  writeSub: Subscription;

  constructor() {
    this.shell = this.getDefaultShell();
    const envVars = Object.assign({}, process.env, {
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      TERM_PROGRAM: 'bterm'
    });

    this.process = spawn(this.shell.shell, this.shell.args, {
      cols: 100,
      rows: 40,
      cwd: os.homedir(),
      env: envVars
    });

    const decoder = new StringDecoder('utf8');
    this.onData = Observable.fromEvent(this.process, 'data').map((x: Buffer) => decoder.write(x)).pipe(share());
    this.onError = Observable.fromEvent(this.process, 'error').map(x => x.toString()).pipe(share());
    this.onExit = Observable.fromEvent(this.process, 'exit').pipe(share());
    this.write = new Subject<string>();
    this.writeSub = this.write.map(input => this.process.write(input)).subscribe();
  }

  getDefaultShell(): { shell: string, args: string[] } {
    let shell = null;

    const exec = execSync('echo $SHELL', { encoding: 'utf8' }).toString();
    if (exec && exec.includes('bin')) {
      shell = exec.trim();
    } else {
      const platform = os.platform();
      if (platform === 'darwin') {
        shell = process.env.SHELL || '/bin/bash';
      } else if (platform === 'win32') {
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

    const args = process.env.SHELL_EXECUTE_FLAGS || '--login';
    return { shell: shell, args: args.split(' ').filter(Boolean) };
  }
}

@Injectable()
export class TerminalService {
  terminals: TerminalType[];
  currentIndex: number;
  lightTheme: ITheme;
  darkTheme: ITheme;
  events: EventEmitter<{ type: string, index: number }>;

  constructor(public windowService: WindowService) {
    this.terminals = [];
    Terminal.applyAddon(fit);
    this.events = new EventEmitter<{ type: string, index: number }>();

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
  }

  create(el: HTMLMainElement): void {
    const doc: HTMLDocument = document;
    const element = doc.createElement('div');
    element.classList.add('terminal-instance');
    el.appendChild(element);

    const terminal: TerminalType = {
      el: element,
      ptyProcess: new PtyProcess(),
      term: new Terminal(),
      title: 'Shell',
      subscriptions: []
    };

    this.terminals.push(terminal);
    this.currentIndex = this.terminals.length - 1;

    terminal.term.open(element);
    terminal.term.setOption('fontFamily', 'Monaco, Menlo, monospace');
    terminal.term.setOption('fontSize', 12);
    terminal.term.setOption('theme', this.darkTheme);
    this.focusCurrentTab();

    terminal.subscriptions.push(terminal.ptyProcess.onData.subscribe(data => {
      terminal.term.write(data);
    }));
    terminal.subscriptions.push(terminal.ptyProcess.onError.subscribe(data => {
      this.destroy();
    }));
    terminal.subscriptions.push(terminal.ptyProcess.onExit.subscribe((exitCode) => {
      this.destroy();
    }));
    terminal.subscriptions.push(
      Observable.fromEvent(terminal.term, 'title')
        .pipe(filter((x, i) => i % 2 === 0))
        .subscribe((title: string) => {
          terminal.title = title;
        })
    );
    terminal.subscriptions.push(
      Observable.fromEvent(terminal.term, 'key').subscribe((key: string) => {
        terminal.ptyProcess.write.next(key);
      })
    );
    terminal.subscriptions.push(
      Observable.fromEvent(terminal.term, 'resize').subscribe((sizeData: any) => {
        terminal.ptyProcess.process.resize(sizeData.cols, sizeData.rows);
      })
    );
    terminal.subscriptions.push(
      this.windowService.size.subscribe(size => {
        (<any>terminal.term).fit();
      })
    );
  }

  focusTab(i: number): void {
    const terminal = this.terminals[i];
    this.currentIndex = i;
    this.events.emit({ type: 'focusTab', index: i });
    terminal.term.focus();
  }

  focusCurrentTab(): void {
    const terminal = this.terminals[this.currentIndex];
    this.events.emit({ type: 'focusTab', index: this.currentIndex });
    terminal.term.focus();
  }

  destroy(i?: number): void {
    const index = typeof i === 'undefined' ? this.currentIndex : i;
    const terminal = this.terminals[index];
    terminal.subscriptions.forEach(sub => sub.unsubscribe());
    terminal.ptyProcess.process.kill();
    this.events.emit({ type: 'destroy', index: index });
  }
}
