import { Component, OnInit, HostBinding, Inject, OnDestroy } from '@angular/core';
let electron = require('electron');
let { ipcRenderer, clipboard, remote } = electron;
let { Menu, MenuItem, dialog } = remote;
import { HtermService, Terminal } from '../../services/hterm.service';
import { ConfigService } from '../../services/config.service';
import { EOL } from 'os';
import { writeFile } from 'fs';

@Component({
  selector: 'window-terminal',
  templateUrl: 'window-terminal.component.html'
})
export class WindowTerminalComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'window-terminal';
  ctxMenu :Electron.Menu;
  constructor(
    @Inject(HtermService) private hterm: HtermService,
    @Inject(ConfigService) private config: ConfigService
  ) { }

  ngOnInit() {
    this.hterm.create();
    setTimeout(() => this.config.setConfig());

    ipcRenderer.on('newTab', () => { this.hterm.create(), this.frameListener(false); } );
    ipcRenderer.on('closeTab', () => { this.hterm.deleteTab(), this.frameListener(false); } );
    ipcRenderer.on('clearTab', () => this.hterm.clearTab());
    ipcRenderer.on('switchTab', (ev, data) => this.hterm.switchTab(data));
    ipcRenderer.on('tabLeft', () => this.hterm.switchPrev());
    ipcRenderer.on('tabRight', () => this.hterm.switchNext());
    ipcRenderer.on('focusCurrent', () => this.hterm.focusCurrent());

    this.initMenu();
    setTimeout( () => this.frameListener(false) );
  }

  initMenu() {
    this.ctxMenu = new Menu();
    this.ctxMenu.append(new MenuItem({
      label: "Copy", 
      click: () => this.copy()
    }));
    this.ctxMenu.append(new MenuItem({
      label: "Paste",
      click: () => this.paste()
    }));
  }

  getFrameDocs() :HTMLDocument[] {
    let hostFrames :NodeListOf<HTMLIFrameElement> = document.querySelectorAll('iframe');
    let frameDocs :any[] = [];
 
    for (let i = 0; i<hostFrames.length; i++) {
      let hostFrame :HTMLIFrameElement = hostFrames.item(i);
      let frameWin :Window = hostFrame && hostFrame.contentWindow;
      frameDocs.push(frameWin && frameWin.document);
    }

    return frameDocs;
  }

  frameListener(detachOnly :boolean = true) :void {
    this.getFrameDocs().forEach(frameDoc => {
      let frameBody :HTMLElement = frameDoc.querySelector('body');
      if (frameBody) { frameBody.removeEventListener('contextmenu', this.popup); }      
      if (!detachOnly) {
                frameBody.addEventListener('contextmenu', this.popup);
      }
    });
  }

  popup = (ev :any) => { this.ctxMenu.popup(remote.getCurrentWindow()); }

  copy() {
    let frameDocs :any[] = this.getFrameDocs();
    frameDocs.forEach(frameDoc => {
      if (frameDoc.getSelection) {
        let copyText :string = frameDoc.getSelection().toString();
        if (copyText.length > 0) {
          clipboard.writeText(copyText);
          frameDoc.getSelection().removeAllRanges();
        }
      }
    })
  }
  
  paste() :void {    this.hterm.terminals[this.hterm.currentIndex].output.emit(clipboard.readText());  }

  ngOnDestroy() {
    this.frameListener();
  }

}