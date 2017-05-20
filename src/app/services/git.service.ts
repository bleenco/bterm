import { Injectable, Inject, Provider } from '@angular/core';
import { ConfigService } from './config.service';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GITService {
  currentBranch: string;
  cwd: string;

  constructor(@Inject(ConfigService) private _config: ConfigService) {
    this.currentBranch = null;
    this.cwd = null;
  }

  hasGit(): boolean {
    if (!this.cwd) { return false; }
    let gitDir: string = path.join(this.cwd, '.git');

    if (gitDir.startsWith('~')) { gitDir = gitDir.replace(/~/, os.homedir()); }

    if (fs.existsSync(gitDir)) {
      try {
        let head: string = fs.readFileSync(path.join(gitDir, 'HEAD')).toString();
        let parts = head.split('/') || null;
        this.branch = parts[parts.length - 1] || null;
        return true;
      } catch (e) {
        this.currentBranch = null;
        return false;
      }
    } else {
      this.branch = null;
      return false;
    }
  }

  set branch(b: string) { this.currentBranch = b; }
  get branch(): string { return this.currentBranch; }

  set dir(d: string) {
    this.cwd = d;
    this.hasGit();
  }
}

export let GITServiceProvider: Provider = {
  provide: GITService, useClass: GITService
};
