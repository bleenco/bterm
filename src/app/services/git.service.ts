import { Injectable, Inject, Provider } from '@angular/core';
import { ConfigService } from './config.service';
import * as os from 'os';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as path from 'path';
import { which } from 'shelljs';

export type TGitStatus = '?'|'*'|'\u2713';

@Injectable()
export class GITService {
  currentBranch: Promise<string>;
  currentStatus: Promise<TGitStatus>;

  cwd: string;
  git: GITHandler;

  constructor(@Inject(ConfigService) private _config: ConfigService) {
    this.git = new GITHandler();
    this.cwd = null;
  }

  parseStatus(s: string): TGitStatus {
    if (s === null) { return '?'; }
    if (s.trim().length === 0) { return '\u2713'; }
    if (s.length > 0) { return '*'; }
    return '?';
  }

  get status(): Promise<TGitStatus> {
    if (!this.cwd) { return Promise.resolve('?' as TGitStatus); }
    return this.git.from(this.cwd).getStatus().then(status => !status.code ? this.parseStatus(status.value) : '?');
  }

  get branch(): Promise<string> {
    if (!this.cwd) { return Promise.resolve(null); }
    return this.git.from(this.cwd).getBranch().then(branch => !branch.code ? branch.value : null);
  }

  set dir(d: string) {
    this.cwd = d;
    this.cwd = this.cwd.replace(/^~/, os.homedir());
  }
}

export let GITServiceProvider: Provider = {
  provide: GITService,
  useClass: GITService
};

class GITHandler {
  dir: string;
  gitBin: string;

  constructor() {
    this.gitBin = null;
    this.hasGitBin();
  }

  check() {
    if (!this.gitBin || !this.dir) { return false; }
    return true;
  }

  hasGitBin() {
    let gitPath: string = which('git');
    if (gitPath.length >= 3) { this.gitBin = gitPath.toString(); }
  }

  gitExec(params: string[]): Promise<IGitResult> {
    return new Promise<IGitResult>(resolve => {
      if (!this.gitBin || !fs.existsSync(this.dir)) { resolve({ code: null, value: null }); }
      let log: string = '';
      let options: child_process.SpawnSyncOptionsWithStringEncoding = {
        timeout: 100,
        encoding: 'utf8',
        env: process.env,
        cwd: this.dir
      };

      let output: child_process.ChildProcess = child_process.spawn(this.gitBin, params, options);

      output.stdout.on('data', data => log += data.toString());
      output.on('close', (code: number, signal: string) => {
        let result: IGitResult = { code: code, value: log };

        resolve(result);
      });
    });
  }

  from(d: string): GITHandler {
    this.dir = d;
    return this;
  }

  getBranch(): Promise<IGitResult> {
    if (!this.check()) { return null; }
    return this.gitExec(['rev-parse', '--abbrev-ref',  'HEAD']);
  }

  getStatus(): Promise<IGitResult> {
    if (!this.check()) { return null; }
    return this.gitExec(['status', '--porcelain']);
  }

}

interface IGitResult {
  code: number;
  value: string;
};
