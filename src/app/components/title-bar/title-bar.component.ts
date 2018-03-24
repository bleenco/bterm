import { Component } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html'
})
export class TitleBarComponent {
  constructor(public terminalService: TerminalService) { }

  closeTab(index: number): void {
    this.terminalService.destroy(index);
  }

  closeWindow(): void {
    this.terminalService.destroyAll();
  }

  minimizeWindow(): void {
    ipcRenderer.send('minimize');
  }

  maximizeWindow(): void {
    ipcRenderer.send('maximize');
  }
}
