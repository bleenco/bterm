import { Component, OnInit, ElementRef } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.sass']
})
export class TerminalComponent implements OnInit {
  el: HTMLMainElement;

  constructor(public elementRef: ElementRef, public terminalService: TerminalService) { }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.terminal');
    this.terminalService.create(this.el);
  }

}
