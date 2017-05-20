import { Injectable, Inject, Provider } from '@angular/core';
import { ConfigService } from './config.service';
import * as os from 'os';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as path from 'path';
let shx = require('shelljs');

export type TGitStatus = '?'|'*'|'\u2713';

@Injectable()
export class GITService {
  currentBranch: string;
  currentStatus: TGitStatus;

  cwd: string;
  git: GITHandler;

  constructor(@Inject(ConfigService) private _config: ConfigService) {
    this.git = new GITHandler();
    this.currentBranch = null;
    this.currentStatus = '?';
    this.cwd = null;
  }

  hasGit(): boolean {
    if (!this.cwd) { return false; }
    this.cwd = this.cwd.replace(/^~/, os.homedir());

    try {
      let branch: IGitResult = this.git.from(this.cwd).getBranch();
      this.branch = !branch.code ? branch.value : null;

      let status = this.git.from(this.cwd).getStatus();
      this.status = !status.code ? this.parseStatus(status.value) : '?';
      return true;
    } catch (e) {
      this.currentStatus = null;
      this.currentBranch = null;
      return false;
    }
  }

  parseStatus(s: string): TGitStatus {
    if (s.trim().length === 0) { return '\u2713'; }
    if (s.length > 0) { return '*'; }
    return '?';
  }

  get status(): TGitStatus { return this.currentStatus; }
  set status(s: TGitStatus) { this.currentStatus = s; }
  set branch(b: string) { this.currentBranch = b; }
  get branch(): string { return this.currentBranch; }

  set dir(d: string) {
    this.cwd = d;
    this.hasGit();
  }
}

export let GITServiceProvider: Provider = {
  provide: GITService,
  useClass: GITService
};

class GITHandler {
  cwd: string;
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
    let gitPath: string = shx.which('git');
    if (gitPath.length > 3) { this.gitBin = gitPath; }
    console.log('git bin: ', gitPath);
  }

  gitExec(params: string[]): IGitResult {
    if (!this.gitBin || !fs.existsSync(this.dir)) { return; }
    let options: child_process.SpawnSyncOptionsWithStringEncoding = {
      timeout: 50,
      encoding: 'utf8',
      env: process.env,
      stdio: 'pipe'
    };

    this.cwd = process.cwd();
    process.chdir(this.dir);
    let output: child_process.SpawnSyncReturns<string> = child_process.spawnSync(this.gitBin, params, options);
    process.chdir(this.cwd);

    let result: IGitResult = { code: output.status, value: output.output.join('\n').trim() }

    if (!result.code) { return result || null; }
    return null;
  }

  from(d: string): GITHandler {
    this.dir = d;
    return this;
  }

  getBranch(): IGitResult {
    if (!this.check()) { return null; }
    return this.gitExec(['rev-parse', '--abbrev-ref',  'HEAD']);
  }

  getStatus(): IGitResult {
    if (!this.check()) { return null; }
    return this.gitExec(['status', '--porcelain']);
  }

}

interface IGitResult {
  code: number;
  value: string;
};
