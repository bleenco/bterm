import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';
import { ipcRenderer, remote, clipboard } from 'electron';
import { Observable, Subscription, fromEvent, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.sass']
})
export class TerminalComponent implements OnInit, OnDestroy {
  el: HTMLMainElement;
  subs: Subscription[] = [];

  constructor(
    public elementRef: ElementRef,
    public terminalService: TerminalService,
    public renderer: Renderer2
  ) { }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.terminal');
    this.initIpcListeners();
    this.initTerminalEvents();
    this.terminalService.create(this.el);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  initIpcListeners(): void {
    this.subs.push(
      fromEvent(ipcRenderer, 'move')
        .pipe(debounce(() => timer(100)))
        .subscribe(event => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'newTab')
        .subscribe(() => this.terminalService.create(this.el))
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'resize')
        .subscribe(() => {
          this.terminalService.terminals.forEach(terminal => {
            (<any>terminal.term).fit();
            terminal.term.focus();
          });
        })
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'restore')
        .subscribe(() => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'enter-full-screen')
        .subscribe(() => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'leave-full-screen')
        .subscribe(() => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'tabLeft')
        .subscribe(() => this.previousTab())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'tabRight')
        .subscribe(() => this.nextTab())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'paste')
        .subscribe(() => this.paste())
    );

    this.subs.push(
      fromEvent(ipcRenderer, 'copy')
        .subscribe(() => this.copy())
    );
  }

  initTerminalEvents(): void {
    this.terminalService.events.subscribe(event => {
      const elements = this.el.querySelectorAll('.terminal-instance');
      if (event.type === 'focusTab') {
        this.setActiveTab(event.index);
      } else if (event.type === 'destroy') {
        const element = elements[event.index];
        this.renderer.removeChild(element.parentElement, element);
        this.terminalService.terminals = this.terminalService.terminals.filter(t => t.el !== element);
        const index = this.el.querySelectorAll('.terminal-instance').length - 1;
        if (index > -1) {
          this.setActiveTab(index);
          this.terminalService.focusTab(index);
        } else {
          ipcRenderer.send('close', remote.getCurrentWindow().id);
        }
      }
    });
  }

  setActiveTab(i: number): void {
    const elements = this.el.querySelectorAll('.terminal-instance');
    [].forEach.call(elements, el => this.renderer.setStyle(el, 'z-index', 0));
    this.renderer.setStyle(elements[i], 'z-index', 10);
    (<any>this.terminalService.terminals[i].term).focus();
    (<any>this.terminalService.terminals[i].term).fit();
  }

  previousTab(): void {
    if (this.terminalService.terminals.length === 1) {
      return;
    }

    const currentIndex = this.terminalService.currentIndex;
    let index = null;
    if (currentIndex - 1 < 0) {
      index = this.terminalService.terminals.length - 1;
    } else {
      index = currentIndex - 1;
    }

    this.terminalService.currentIndex = index;
    this.setActiveTab(index);
    this.terminalService.focusTab(index);
  }

  nextTab(): void {
    if (this.terminalService.terminals.length === 1) {
      return;
    }

    const currentIndex = this.terminalService.currentIndex;
    let index = null;
    if (currentIndex + 1 > this.terminalService.terminals.length - 1) {
      index = 0;
    } else {
      index = currentIndex + 1;
    }

    this.terminalService.currentIndex = index;
    this.setActiveTab(index);
    this.terminalService.focusTab(index);
  }

  paste(): void {
    this.terminalService.terminals[this.terminalService.currentIndex].ptyProcess.write.next(clipboard.readText());
  }

  copy(): void {
    const term = this.terminalService.terminals[this.terminalService.currentIndex].term;
    if (term.hasSelection()) {
      const selection = term.getSelection();
      clipboard.writeText(selection);
      term.clearSelection();
    }
  }

}
