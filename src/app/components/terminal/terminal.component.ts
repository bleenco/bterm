import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';
import { ipcRenderer, remote } from 'electron';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { timer } from 'rxjs/observable/timer';
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
      Observable.fromEvent(ipcRenderer, 'move')
        .pipe(debounce(() => timer(100)))
        .subscribe(event => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      Observable.fromEvent(ipcRenderer, 'newTab')
        .subscribe(() => this.terminalService.create(this.el))
    );

    this.subs.push(
      Observable.fromEvent(ipcRenderer, 'resize')
        .subscribe(() => {
          this.terminalService.terminals.forEach(terminal => {
            (<any>terminal.term).fit();
            terminal.term.focus();
          });
        })
    );

    this.subs.push(
      Observable.fromEvent(ipcRenderer, 'restore')
        .subscribe(() => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      Observable.fromEvent(ipcRenderer, 'enter-full-screen')
        .subscribe(() => this.terminalService.focusCurrentTab())
    );

    this.subs.push(
      Observable.fromEvent(ipcRenderer, 'leave-full-screen')
        .subscribe(() => this.terminalService.focusCurrentTab())
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
    [].forEach.call(elements, el => this.renderer.setStyle(el, 'display', 'none'));
    this.renderer.setStyle(elements[i], 'display', 'block');
    (<any>this.terminalService.terminals[i].term).fit();
  }

}
