import { Injectable, Provider, EventEmitter } from '@angular/core';
import * as os from 'os';
let pty = require('node-pty');

export interface Process {
  pty: any,
  input: EventEmitter<string>,
  output: EventEmitter<string>,
  resize: EventEmitter<{ col: number, row: number }>,
  exit: EventEmitter<boolean>
}

@Injectable()
export class PTYService {
  shell: string;
  args: string[];
  user: any;
  path: string;
  processes: Process[];

  constructor() {
    this.user = os.userInfo({ encoding: 'utf8' });
    switch (os.platform()) {
      case 'win32':
        this.shell = 'bash.exe';
        this.args = [];
        break;
      case 'darwin':
        this.shell = 'login';
        this.args = ['-fp', this.user.username];
        break;
      case 'linux':
        this.shell = '/bin/bash';
        this.args = [];
        break;
    }
    this.processes = [];
  }

  create(): Process {
    let ps: Process = {
      pty: pty.spawn(this.shell, this.args, {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: os.homedir(),
        env: process.env
      }),
      input: new EventEmitter<string>(),
      output: new EventEmitter<string>(),
      resize: new EventEmitter<{ col: number, row: number }>(),
      exit: new EventEmitter<boolean>()
    };

    this.initializeEvents(ps);
    return ps;
  }

  initializeEvents(ps: Process): void {
    ps.pty.on('data', (data: string) => ps.output.emit(data));
    ps.pty.on('exit', (data: string) => {
      if (ps.pty) { ps.pty.kill('SIGHUP'); }
      this.processes = this.processes.filter((proc: Process) => proc !== ps);
      ps.exit.emit(true);
    });
    ps.input.subscribe((data: string) => ps.pty.write(data));
    ps.resize.subscribe((data: { col: number, row: number }) => ps.pty.resize(data.col, data.row));
  }
}

export let PTYServiceProvider: Provider = {
  provide: PTYService, useClass: PTYService
};
