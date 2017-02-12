import { Component, Inject, NgZone } from '@angular/core';
import { HtermService } from '../../services/hterm.service';
import { ConfigService } from '../../services/config.service';
let electron = require('electron');
let { ipcRenderer } = electron;

export interface Tab {
  active: boolean,
  title: string
}

@Component({
  selector: 'window-top',
  templateUrl: 'window-top.component.html'
})
export class WindowTopComponent {
  tabs: Tab[];

  constructor(
    @Inject(HtermService) private hterm: HtermService,
    @Inject(ConfigService) private config: ConfigService,
    @Inject(NgZone) private zone: NgZone) {
    this.tabs = [];

    hterm.outputEvents.subscribe((event: any) => {
      if (event.action === 'created') {
        this.tabs.forEach((tab: Tab) => tab.active = false);
        this.zone.run(() => {
          this.tabs.push({ active: true, title: 'node' });
          this.config.setConfig();
        });
      } else if (event.action === 'closed') {
        this.zone.run(() => {
          this.tabs.splice(event.data, 1);
          this.tabs[event.data].active = true;
          this.config.setConfig();
        });
      } else if (event.action === 'switch') {
        this.zone.run(() => {
          this.tabs.forEach((tab: Tab) => tab.active = false);
          this.tabs[event.data].active = true;
          this.config.setConfig();
        });
      }
    });
  }

  switchTab(index: number): void {
    this.hterm.switchTab(index);
    this.tabs.forEach((tab: Tab) => tab.active = false);
    this.tabs[index].active = true;
    this.config.setConfig();
  }

  close(): void { ipcRenderer.send('close'); }
  minimize(): void { ipcRenderer.send('minimize'); }
  maximize(): void { ipcRenderer.send('maximize'); }

}
