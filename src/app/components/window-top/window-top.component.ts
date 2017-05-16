import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { XtermService } from '../../services/xterm.service';
import { ConfigService } from '../../services/config.service';
let electron = require('electron');
let remote = require('electron').remote;
let { ipcRenderer } = electron;
let { dialog } = remote;

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

  constructor(
    @Inject(XtermService) private hterm: XtermService,
    @Inject(ConfigService) private config: ConfigService,
    @Inject(NgZone) private zone: NgZone) {
    this.tabs = [];

    hterm.outputEvents.subscribe((event: any) => {
      if (event.action === 'created') {
        this.tabs.forEach((tab: Tab) => tab.active = false);
        this.zone.run(() => {
          this.tabs.push({ active: true, title: 'Shell' });
          setTimeout(() => this.config.setConfig());
        });
      } else if (event.action === 'closed') {
        this.zone.run(() => {
          this.tabs.splice(event.data, 1);
          this.tabs[event.data].active = true;
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
    this.hterm.titleEvents.subscribe(data => {
      if (data.title === ':') {
        return;
      }

      if (typeof this.tabs[data.index] !== 'undefined') {
        this.tabs[data.index].title = this.parseTitle(data.title);
      }
    });
  }

  switchTab(index: number): void {
    this.hterm.switchTab(index);
    this.tabs.forEach((tab: Tab) => tab.active = false);
    this.tabs[index].active = true;
    this.config.setConfig();
  }

  parseTitle(title: string): string {
    if (title.indexOf(':') !== -1 && title.indexOf('~') !== -1) {
      return title.split(':').slice(0, -1).join(':').trim();
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

  minimize(): void { ipcRenderer.send('minimize'); }
  maximize(): void { ipcRenderer.send('maximize'); }
  tabMaximize(): void { ipcRenderer.send('tabMaximize'); }
}
