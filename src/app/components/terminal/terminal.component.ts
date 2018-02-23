import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';
import { ipcRenderer } from 'electron';
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
export class TerminalComponent implements OnInit {
  el: HTMLMainElement;

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

  initIpcListeners(): void {
    Observable.fromEvent(ipcRenderer, 'move')
      .pipe(debounce(() => timer(100)))
      .subscribe(event => this.terminalService.focusCurrentTab());

    Observable.fromEvent(ipcRenderer, 'newTab')
      .subscribe(() => this.terminalService.create(this.el));
  }

  initTerminalEvents(): void {
    this.terminalService.events.subscribe(event => {
      if (event.type === 'focusTab') {
        console.log(event.index);
        const elements = this.el.querySelectorAll('.terminal-instance');
        [].forEach.call(elements, el => this.renderer.setStyle(el, 'display', 'none'));
        this.renderer.setStyle(this.terminalService.terminals[event.index].el, 'display', 'block');
        (<any>this.terminalService.terminals[event.index].term).fit();
      }
    });
  }

}
