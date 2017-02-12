import { Component, AfterViewInit, HostBinding, Inject } from '@angular/core';
let electron = require('electron');
let { ipcRenderer } = electron;
import { HtermService } from '../../services/hterm.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'window-terminal',
  templateUrl: 'window-terminal.component.html'
})
export class WindowTerminalComponent implements AfterViewInit {
  @HostBinding('class') class = 'window-terminal';

  constructor(
    @Inject(HtermService) private hterm: HtermService,
    @Inject(ConfigService) private config: ConfigService
  ) { }

  ngAfterViewInit() {
    this.hterm.create();
    this.config.setConfig();

    ipcRenderer.on('newTab', () => this.hterm.create());
    ipcRenderer.on('switchTab', (ev, data) => this.hterm.switchTab(data));
    ipcRenderer.on('tabLeft', () => this.hterm.switchPrev());
    ipcRenderer.on('tabRight', () => this.hterm.switchNext());
    ipcRenderer.on('focusCurrent', () => this.hterm.focusCurrent());
  }
}
