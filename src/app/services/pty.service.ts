import { Injectable, Provider, EventEmitter, Inject } from '@angular/core';
import { ConfigService } from './config.service';
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
  path: string;
  processes: Process[];

  constructor(@Inject(ConfigService) private _config: ConfigService) {
    this.processes = [];
  }

  create(cwd = os.homedir()): Process {
    const defaultShell = this._config.getDefaultShell();
    const shell = defaultShell.shell;
    const args = defaultShell.args;

    const ps: Process = {
      pty: pty.spawn(shell, args, {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: cwd
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
      if (ps.pty) {
        ps.pty.kill();
      }
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
