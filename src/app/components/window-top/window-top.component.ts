import { Component, Inject, NgZone, OnInit, HostListener } from '@angular/core';
import { XtermService } from '../../services/xterm.service';
import { ConfigService } from '../../services/config.service';
let electron = require('electron');
let remote = require('electron').remote;
let { ipcRenderer } = electron;
let { dialog } = remote;
import { platform } from 'os';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/distinct';

export interface Tab {
  active: boolean,
  title: string
}

@Component({
  selector: 'window-top',
  templateUrl: 'window-top.component.html'
})
export class WindowTopComponent implements OnInit {
  tabs: Tab[];
  isDarwin: boolean;
  isDisabled: boolean;

  constructor(
    @Inject(XtermService) private xterm: XtermService,
    @Inject(ConfigService) private config: ConfigService,
    @Inject(NgZone) private zone: NgZone) {
    this.tabs = [];
    this.isDarwin = platform() === 'darwin';
    xterm.outputEvents.subscribe((event: any) => {
      if (event.action === 'created') {
        this.tabs.forEach((tab: Tab) => tab.active = false);
        this.zone.run(() => {
          this.tabs.push({ active: true, title: 'Shell' });
          setTimeout(() => this.config.setConfig());
        });
      } else if (event.action === 'closed') {
        this.zone.run(() => {
          this.tabs.splice(event.data, 1);
          if (this.tabs.findIndex(t => t.active) === -1) {
            this.tabs[this.tabs.length - 1].active = true;
          }
          setTimeout(() => this.config.setConfig());
        });
      } else if (event.action === 'switch') {
        this.zone.run(() => {
          this.tabs.forEach((tab: Tab) => tab.active = false);
          this.tabs[event.data].active = true;
          setTimeout(() => this.config.setConfig());
        });
      }
    });
  }

  ngOnInit() {
    this.xterm.titleEvents.subscribe(data => {
      if (data.title === ':') {
        return;
      }

      if (typeof this.tabs[data.index] !== 'undefined') {
        this.tabs[data.index].title = this.parseTitle(data.title);
      }
    });

    if (!this.isDarwin) { this.handleDrag(); }
  }

  switchTab(e: MouseEvent, index: number): void {
    e.preventDefault();
    this.xterm.switchTab(index);
    this.tabs.forEach((tab: Tab) => tab.active = false);
    this.tabs[index].active = true;
    this.config.setConfig();
  }

  parseTitle(title: string): string {
    if (title.indexOf(':') !== -1 && title.indexOf('~') !== -1) {
      return title.split(':').slice(0, -1).join(':').trim();
    } else if (title === '') {
      return 'Shell';
    } else {
      return title;
    }
  }

  close(): void {
    if (this.tabs.length === 1) {
      ipcRenderer.send('close');
    } else {
      let choice = dialog.showMessageBox(
        remote.getCurrentWindow(),
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit and close all tabs?'
        }
      );

      if (choice === 0) {
        ipcRenderer.send('close');
      }
    }
  }

  closeTab(e: MouseEvent, index: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.xterm.deleteTabByIndex(index);
  }

  minimize(): void { ipcRenderer.send('minimize'); }

  maximize(): void {
    ipcRenderer.send('maximize');
    if (this.isDarwin) {
      this.isDisabled = !this.isDisabled;
    }
  }

  tabMaximize(): void { ipcRenderer.send('tabMaximize'); }

  handleDrag() {
    let win: Electron.BrowserWindow = electron.remote.getCurrentWindow();
    let winSize: number[] = [];
    let startWinPos: number[] = electron.remote.getCurrentWindow().getPosition();
    let startPos: any;
    let endPos: any;

    const draggable: Element = document.querySelector('.window-top-container');

    const mouseUp$: Observable<any> = Observable.fromEvent(window, 'mouseup');
    const mouseMove$: Observable<any> = Observable.fromEvent(window, 'mousemove');
    const mouseDown$: Observable<any> = Observable.fromEvent(draggable, 'mousedown');

    let dragStart$: Observable<any> = mouseDown$.mergeMap(
      (md: any) => {
        winSize = win.getSize();
        startPos = win.getPosition();
        let startX: number = md.screenX;
        let startY: number = md.screenY;

        return mouseMove$.map(
          (mm: any) => {
            mm.preventDefault();
            return([ mm.screenX - startX, mm.screenY - startY ]);
          }
        )
        .filter(x => x[0] !== 0 || x[1] !== 0)
        .takeUntil(mouseUp$)
      }
    )
    .distinct(x => x[0] * x[1]);

    let subscription: any = dragStart$.subscribe((pos: any) => {
      win.setPosition(startPos[0] + pos[0], startPos[1] + pos[1], true);
      win.setSize(winSize[0], winSize[1]);
    });
  }

}
