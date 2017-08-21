import { Component, Inject, NgZone, OnInit, Renderer, ElementRef } from '@angular/core';
import { XtermService } from '../../services/xterm.service';
import { platform } from 'os';
import { GITService, TGitStatus } from '../../services/git.service';
import { existsSync } from 'fs';
import { homedir } from 'os';
const { remote, ipcRenderer } = require('electron');

export class ISearchForm {
  query: string
};

@Component({
  selector: 'window-bottom',
  templateUrl: 'window-bottom.component.html'
})
export class WindowBottomComponent implements OnInit {
  currentDir: string;
  currentProcess: string;
  currentBranch: string;
  currentStatus: TGitStatus;
  keyword: string;
  searchVisible: boolean;

  constructor(
    @Inject(NgZone) private zone: NgZone,
    @Inject(XtermService) private xterm: XtermService,
    @Inject(GITService) private _git: GITService,
    @Inject(Renderer) private renderer: Renderer,
    @Inject(ElementRef) private el: ElementRef
  ) { }

  ngOnInit() {
    this.xterm.titleEvents.subscribe(event => {
      if (event.title === ':') {
        this.currentDir = null;
        this._git.dir = null;
        this.currentBranch = null;
        this.currentStatus = '?';
        return;
      }

      this.zone.run(() => {
        if (this.xterm.terminals[event.index] && event.index === this.xterm.currentIndex) {
          let dir;
          if (this.xterm.terminals[event.index].title.indexOf(':') !== -1) {
            dir = this.xterm.terminals[event.index].title.split(':')[1].trim();
          } else if (this.xterm.terminals[event.index].title.indexOf('~') !== -1) {
            dir = this.xterm.terminals[event.index].title.trim();
          }

          if (dir) {
            dir = dir.replace(/~/, homedir());
            if (existsSync(dir)) {
              this.currentDir = dir;
              this._git.dir = this.currentDir;
              this._git.branch.then(res => this.currentBranch = res);
              this._git.status.then(res => this.currentStatus = res);
              this.xterm.cwd = dir;
            }
          }
        }
      });
    });

    ipcRenderer.on('search', () => {
      this.searchVisible = true;
      setTimeout(() => {
        this.renderer.invokeElementMethod(this.el.nativeElement.querySelector('.search-input'), 'focus', []);
      }, 300);
    });
  }

  showDir(): void {
    remote.shell.showItemInFolder(this.currentDir);
  }

  search(): void {
    this.xterm.search.next({ type: 'typing', term: this.keyword });
  }

  onKeyUp(e: KeyboardEvent): void {
    if (e.keyCode === 13) {
      this.xterm.search.next({ type: 'immediate', term: this.keyword });
    } else if (e.keyCode === 27) {
      if (this.keyword !== '') {
        this.keyword = '';
      } else {
        this.searchVisible = false;
        this.xterm.focusCurrent();
      }
    }
  }
}
