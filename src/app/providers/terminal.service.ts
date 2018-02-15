import { Injectable } from '@angular/core';
import { WindowService } from './window.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/filter';
import * as os from 'os';
import { spawn } from 'node-pty';
import { Terminal, ITheme } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

export interface PtyProcessType {
  process: any;
  onData: Observable<string>;
  write: Subject<string>;
  writeSub: Subscription;
}

export interface TerminalType {
  ptyProcess: PtyProcess;
  term: Terminal;
  title: string;
  subscriptions: Subscription[];
}

class PtyProcess implements PtyProcessType {
  process: any;
  onData: Observable<string>;
  write: Subject<string>;
  writeSub: Subscription;

  constructor(shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash') {
    this.process = spawn(shell, [], {
      name: 'xterm-color',
      cols: 120,
      rows: 30,
      cwd: process.env.HOME
    });

    this.onData = Observable.fromEvent(this.process, 'data').map(x => x.toString()).share();
    this.write = new Subject<string>();
    this.writeSub = this.write.map(input => this.process.write(input)).subscribe();
  }
}

@Injectable()
export class TerminalService {
  terminals: TerminalType[];
  currentIndex: number;
  lightTheme: ITheme;

  constructor(public windowService: WindowService) {
    this.terminals = [];
    Terminal.applyAddon(fit);
    this.lightTheme = {
      foreground: '#000000',
      background: '#ffffff',
      cursor: '#000000',
      cursorAccent: '#000000',
      selection: 'rgba(0, 0, 0, 0.1)',
      black: '#000000',
      red: "#de3e35",
      green: "#3f953a",
      yellow: "#d2b67c",
      blue: "#2f5af3",
      magenta: "#950095",
      cyan: "#3f953a",
      white: "#bbbbbb",
      brightBlack: "#000000",
      brightRed: "#de3e35",
      brightGreen: "#3f953a",
      brightYellow: "#d2b67c",
      brightBlue: "#2f5af3",
      brightMagenta: "#a00095",
      brightCyan: "#3f953a",
      brightWhite: "#ffffff"
    };
  }

  create(el: HTMLMainElement): void {
    const terminal: TerminalType = {
      ptyProcess: new PtyProcess(),
      term: new Terminal(),
      title: 'Shell',
      subscriptions: []
    };

    this.terminals.push(terminal);
    this.currentIndex = this.terminals.length;

    terminal.term.open(el);
    terminal.term.setOption('fontFamily', 'Monaco');
    terminal.term.setOption('fontSize', 12);
    terminal.term.setOption('theme', this.lightTheme);
    terminal.term.focus();

    terminal.subscriptions.push(terminal.ptyProcess.onData.subscribe(data => {
      terminal.term.write(data);
    }));
    terminal.subscriptions.push(
      Observable.fromEvent(terminal.term, 'title')
        .filter((x, i) => i % 2 === 0)
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
}
