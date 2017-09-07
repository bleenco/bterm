import { Component, OnInit, HostBinding, Inject, HostListener } from '@angular/core';
let electron = require('electron');
let { ipcRenderer, clipboard, remote } = electron;
let { Menu, MenuItem, dialog } = remote;
import { HtermService, Terminal } from '../../services/hterm.service';
import { EOL } from 'os';
import { writeFile } from 'fs';

@Component({
  selector: 'window-terminal',
  templateUrl: 'window-terminal.component.html'
})
export class WindowTerminalComponent implements OnInit {
  @HostBinding('class') class = 'window-terminal';
  ctxMenu: any;
  ctrlKey: boolean;
  selectionTimeout: any;

  constructor(@Inject(HtermService) private hterm: HtermService) {}

  ngOnInit() {
    this.hterm.create();
    this.ctrlKey = false;

    ipcRenderer.on('newTab', () => this.hterm.create());
    ipcRenderer.on('closeTab', () => this.hterm.deleteTab());
    ipcRenderer.on('clearTab', () => this.hterm.clearTab());
    ipcRenderer.on('switchTab', (ev, data) => this.hterm.switchTab(data));
    ipcRenderer.on('tabLeft', () => this.hterm.switchPrev());
    ipcRenderer.on('tabRight', () => this.hterm.switchNext());
    ipcRenderer.on('focusCurrent', () => this.hterm.focusCurrent());

    ipcRenderer.on('paste', () => this.paste());
    ipcRenderer.on('copy', () => this.copy());
    ipcRenderer.on('navigate', (ev, url) => {
      this.hterm.terminals[this.hterm.currentIndex].output.emit(url);
    });
    this.initMenu();

    ipcRenderer.on('url-clicked', (ev, url) => {
      if (this.ctrlKey) {
        this.ctrlKey = false;
        remote.shell.openExternal(url);
        return;
      }

      clipboard.writeText(url);
    });
  }

  initMenu() {
    this.ctxMenu = new Menu();
    this.ctxMenu.append(new MenuItem({ label: 'Copy', click: () => this.copy() }));
    this.ctxMenu.append(new MenuItem({ label: 'Paste', click: () => this.paste() }));
  }

  popup = (ev: any) => {
    this.ctxMenu.popup(remote.getCurrentWindow());
  }

  copy() {
    if (document.getSelection) {
      let copyText: string = document.getSelection().toString();
      if (copyText.length) {
        clipboard.writeText(copyText);
        document.getSelection().removeAllRanges();
      }
    }
  }

  paste(): void {
    this.hterm.terminals[this.hterm.currentIndex].output.emit(clipboard.readText());
  }

  saveBuffer(): void {
    let parent: HTMLElement = <HTMLElement>document.querySelector('.terminal-instance.active .xterm-rows');
    if (!parent) { return; }

    let lines: NodeList = parent.querySelectorAll('div');
    let lineBuffer: string[] = [].map.call(lines, (line: Node) => line.textContent).filter(line => line.length);

    dialog.showSaveDialog(remote.getCurrentWindow(), {}, (fn) => {
      if (!fn) { return; }

      writeFile(fn, lineBuffer.join(EOL), (err) => {
        if (err) { alert(`Error writing screen buffer to file "${fn}"`); }
      });
    });
  }

  @HostListener('document:contextmenu', ['$event'])
  contextMenu(ev: any) { this.popup(ev); }

  @HostListener('document:selectionchange', ['$event'])
  autoCopy(ev: any) {
    if (this.selectionTimeout) {
      clearTimeout(this.selectionTimeout);
    }
    this.selectionTimeout = setTimeout(() => { this.copy(); }, 1000);
    return false;
  }

}
