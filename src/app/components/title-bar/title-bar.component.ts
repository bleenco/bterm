import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';
import { ipcRenderer } from 'electron';
import { platform } from 'os';

@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html'
})
export class TitleBarComponent implements OnInit {
  constructor(public terminalService: TerminalService, private elementRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    const header = this.elementRef.nativeElement.querySelector('.header');
    const buttons = this.elementRef.nativeElement.querySelector('.window-buttons');
    if (platform() === 'darwin') {
      this.renderer.addClass(header, 'is-draggable');
      this.renderer.addClass(buttons, 'is-enabled');
    }
  }

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
