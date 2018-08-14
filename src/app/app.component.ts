import { Component, Inject, Renderer2, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { ConfigService } from './providers/config.service';
import { TerminalService } from './providers/terminal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
    private config: ConfigService,
    private terminal: TerminalService
  ) { }

  ngOnInit() {
    this.config.body = this.document.querySelector('body');

    this.config.configEvents.subscribe(config => {
      this.renderer.setStyle(this.config.body, 'color', config.colors.foreground);
      this.renderer.setStyle(this.config.body, 'background', config.colors.background);
      this.renderer.setStyle(this.config.body, 'border-color', config.borderColor);

      this.terminal.terminals.forEach(terminal => {
        terminal.term.setOption('fontFamily', config.fontFamily);
        terminal.term.setOption('fontSize', config.fontSize);
        terminal.term.setOption('theme', config.colors);
      });
    });

    this.terminal.events
      .pipe(filter(x => x.type === 'create'))
      .subscribe(() => this.config.getConfig());

    this.config.initWatcher();
  }
}
