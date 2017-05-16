import { Component, OnInit, HostBinding, Inject, OnDestroy, HostListener } from '@angular/core';
let electron = require('electron');
let { ipcRenderer, clipboard, remote } = electron;
let { Menu, MenuItem, dialog } = remote;
import { XtermService, Terminal } from '../../services/xterm.service';
import { ConfigService } from '../../services/config.service';
import { EOL } from 'os';
import { writeFile } from 'fs';

@Component({
  selector: 'window-terminal',
  templateUrl: 'window-terminal.component.html'
})
export class WindowTerminalComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'window-terminal';
  ctxMenu: Electron.Menu;

  constructor(
    @Inject(XtermService) private xterm: XtermService,
    @Inject(ConfigService) private config: ConfigService
  ) { }

  ngOnInit() {
    this.xterm.create();
    setTimeout(() => this.config.setConfig());

    ipcRenderer.on('newTab', () => { this.xterm.create(), this.frameListener(false); } );
    ipcRenderer.on('closeTab', () => { this.xterm.deleteTab(), this.frameListener(false); } );
    ipcRenderer.on('clearTab', () => this.xterm.clearTab());
    ipcRenderer.on('switchTab', (ev, data) => this.xterm.switchTab(data));
    ipcRenderer.on('tabLeft', () => this.xterm.switchPrev());
    ipcRenderer.on('tabRight', () => this.xterm.switchNext());
    ipcRenderer.on('focusCurrent', () => this.xterm.focusCurrent());

    this.initMenu();
    setTimeout(() => this.frameListener(false));
  }

  initMenu() {
    this.ctxMenu = new Menu();
    this.ctxMenu.append(new MenuItem({ label: 'Copy', click: () => this.copy() }));
    this.ctxMenu.append(new MenuItem({ label: 'Paste', click: () => this.paste() }));

    if (this.config.config.settings.scrollBufferSave) {
      this.ctxMenu.append(new MenuItem({ label: 'Save Screen Buffer', click: () => this.saveBuffer() }));
    }
  }

  getFrameDocs(): HTMLDocument[] {
    let hostFrames: NodeListOf<HTMLIFrameElement> = document.querySelectorAll('iframe');
    let frameDocs: HTMLDocument[] = [];

    return [].map.call(hostFrames, (hostFrame: HTMLIFrameElement) => hostFrame.contentWindow.document);
  }

  frameListener(detachOnly: boolean = true): void {
    this.getFrameDocs().forEach(frameDoc => {
      let frameBody: HTMLElement = frameDoc.querySelector('body');
      if (frameBody) {
        frameBody.removeEventListener('contextmenu', this.popup);
      }
      if (!detachOnly) {
        frameBody.addEventListener('contextmenu', this.popup);
      }
    });
  }

  popup = (ev: any) => {
    this.ctxMenu.popup(remote.getCurrentWindow());
  }

  copy() {
    this.getFrameDocs().forEach(frameDoc => {
      if (frameDoc.getSelection) {
        let copyText: string = frameDoc.getSelection().toString();
        if (copyText.length) {
          clipboard.writeText(copyText);
          frameDoc.getSelection().removeAllRanges();
        }
      }
    });
  }

  paste(): void {
    this.xterm.terminals[this.xterm.currentIndex].output.emit(clipboard.readText());
  }

  saveBuffer(): void {
    let parent: HTMLIFrameElement = <HTMLIFrameElement>document.querySelector('.terminal-instance.active iframe');
    if (!parent) { return; }

    let doc: HTMLDocument = parent.contentWindow.document;
    let lines: NodeList = doc.querySelectorAll('x-row');
    let lineBuffer: string[] = [].map.call(lines, (line: Node) => line.textContent).filter(line => line.length);

    dialog.showSaveDialog(remote.getCurrentWindow(), (fn) => {
      if (!fn) { return; }

      writeFile(fn, lineBuffer.join(EOL), (err) => {
        if (err) { alert(`Error writing screen buffer to file "${fn}"`); }
      });
    });
  }

  ngOnDestroy() {
    this.frameListener();
  }


  @HostListener('window:resize', ['$event'])
  windowResized(ev: any) { this.xterm.fitTerminal(); }

}
