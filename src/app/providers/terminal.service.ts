import { Injectable, EventEmitter } from '@angular/core';
import { WindowService } from './window.service';
import { Observable, Subject, Subscription, fromEvent } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';
import * as os from 'os';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { execSync } from 'child_process';
import { which } from 'shelljs';
import { StringDecoder } from 'string_decoder';
const spawn = window.require('node-pty').spawn;

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
    this.process = spawn(this.shell.shell, this.shell.args, {
      cols: 80,
      rows: 30,
      cwd: os.homedir()
    });

    const decoder = new StringDecoder('utf8');
    this.onData = fromEvent(this.process, 'data').pipe(map((x: Buffer) => decoder.write(x)), share());
    this.onError = fromEvent(this.process, 'error').pipe(map(x => x.toString()), share());
    this.onExit = fromEvent(this.process, 'exit').pipe(share());
    this.write = new Subject<string>();
    this.writeSub = this.write.pipe(map(input => this.process.write(input[0]))).subscribe();
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
  events: EventEmitter<{ type: string, index: number }>;

  constructor(public windowService: WindowService) {
    this.terminals = [];
    Terminal.applyAddon(fit);
    this.events = new EventEmitter<{ type: string, index: number }>();
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
    this.events.next({ type: 'create', index: null });
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
      fromEvent(terminal.term, 'title')
        .subscribe((title: string) => {
          terminal.title = title;
        })
    );
    terminal.subscriptions.push(
      fromEvent(terminal.term, 'key').subscribe((key: string) => {
        terminal.ptyProcess.write.next(key);
      })
    );
    terminal.subscriptions.push(
      fromEvent(terminal.term, 'resize').subscribe((sizeData: any) => {
        terminal.ptyProcess.process.resize(sizeData.cols, sizeData.rows);
      })
    );
    terminal.subscriptions.push(
      this.windowService.size.subscribe(size => {
        terminal.ptyProcess.process.resize(terminal.term.cols, terminal.term.rows);
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
    (<any>terminal.term).fit();
  }

  destroy(i?: number): void {
    const index = typeof i === 'undefined' ? this.currentIndex : i;
    const terminal = this.terminals[index];
    terminal.subscriptions.forEach(sub => sub.unsubscribe());
    terminal.ptyProcess.process.kill();
    this.events.emit({ type: 'destroy', index: index });
  }

  destroyAll(): void {
    this.terminals.forEach((term, index) => {
      const terminal = this.terminals[index];
      terminal.subscriptions.forEach(sub => sub.unsubscribe());
      terminal.ptyProcess.process.kill();
      this.events.emit({ type: 'destroy', index: index });
    });
  }
}
