import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { HtermService } from '../../services/hterm.service';
import { SearchService } from '../../services/search.service';
import { platform } from 'os';
import { GITService, TGitStatus } from '../../services/git.service';
import { existsSync } from 'fs';
import { homedir } from 'os';
let { remote } = require('electron');

export class ISearchForm {
  query: string
};

export class SearchForm implements ISearchForm {
  query: string;

  constructor(obj?: ISearchForm) {
    this.query = obj && obj.query != null ? obj.query : '';
  }
}

@Component({
  selector: 'window-bottom',
  templateUrl: 'window-bottom.component.html'
})
export class WindowBottomComponent implements OnInit {
  searchForm: SearchForm;
  currentDir: string;
  currentProcess: string;
  currentBranch: string;
  currentStatus: TGitStatus;

  constructor(
    @Inject(NgZone) private zone: NgZone,
    @Inject(SearchService) private search: SearchService,
    @Inject(HtermService) private hterm: HtermService,
    @Inject(GITService) private _git: GITService
  ) { }

  ngOnInit() {
    this.searchForm = new SearchForm();
    this.hterm.titleEvents.subscribe(event => {
      if (event.title === ':') {
        this.currentDir = null;
        this._git.dir = null;
        this.currentBranch = null;
        this.currentStatus = '?';
        return;
      }

      this.zone.run(() => {
        if (this.hterm.terminals[event.index] && event.index === this.hterm.currentIndex) {
          let dir;
          if (this.hterm.terminals[event.index].title.indexOf(':') !== -1) {
            dir = this.hterm.terminals[event.index].title.split(':')[1].trim();
          } else if (this.hterm.terminals[event.index].title.indexOf('~') !== -1) {
            dir = this.hterm.terminals[event.index].title.trim();
          }

          if (dir) {
            dir = dir.replace(/~/, homedir());
            if (existsSync(dir)) {
              this.currentDir = dir;
              this._git.dir = this.currentDir;
              this._git.branch.then(res => this.currentBranch = res);
              this._git.status.then(res => this.currentStatus = res);
              this.hterm.cwd = dir;
            }
          }
        }
      });
    });
  }

  showDir() { remote.shell.showItemInFolder(this.currentDir); }

  queryChanged() {
    if (this.searchForm.query.length > 2) {
      this.search.searchQuery(this.searchForm.query);
    } else {
      this.search.reset();
    }
  }
}
