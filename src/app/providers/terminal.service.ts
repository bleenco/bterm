import { Injectable } from '@angular/core';
import { WindowService } from './window.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
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
  processes: PtyProcess[];
  lightTheme: ITheme;

  constructor(public windowService: WindowService) {
    this.processes = [];
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
    const term = new Terminal();
    term.open(el);
    term.setOption('fontFamily', 'Monaco');
    term.setOption('fontSize', 12);
    term.setOption('theme', this.lightTheme);

    term.focus();
    const proc = new PtyProcess();
    this.processes.push(proc);

    proc.onData.subscribe(data => term.write(data));
    term.on('key', (key: string, e: KeyboardEvent) => proc.write.next(key));
    term.on('resize', sizeData => proc.process.resize(sizeData.cols, sizeData.rows));
    this.windowService.size.subscribe(size => {
      (<any>term).fit();
    });
  }
}
