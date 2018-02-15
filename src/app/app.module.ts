import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ElectronService } from './providers/electron.service';
import { TerminalService } from './providers/terminal.service';
import { WindowService } from './providers/window.service';

import { AppComponent } from './app.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    TerminalComponent,
    TitleBarComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [ElectronService, TerminalService, WindowService],
  bootstrap: [AppComponent]
})
export class AppModule { }
