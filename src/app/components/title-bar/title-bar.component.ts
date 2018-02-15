import { Component, OnInit } from '@angular/core';
import { TerminalService } from '../../providers/terminal.service';

@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html'
})
export class TitleBarComponent implements OnInit {

  constructor(public terminalService: TerminalService) { }

  ngOnInit() {
  }

}
