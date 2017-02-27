import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { HtermServiceProvider } from './services/hterm.service';
import { PTYServiceProvider } from './services/pty.service';
import { ConfigServiceProvider } from './services/config.service';
import { SearchServiceProvider } from './services/search.service';
import { AppComponent } from './app.component';
import { WindowTopComponent } from './components/window-top';
import { WindowTerminalComponent } from './components/window-terminal';
import { WindowBottomComponent } from './components/window-bottom';

@NgModule({
  declarations: [
    AppComponent,
    WindowTopComponent,
    WindowTerminalComponent,
    WindowBottomComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    FormsModule
  ],
  providers: [
    HtermServiceProvider,
    PTYServiceProvider,
    ConfigServiceProvider,
    SearchServiceProvider
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
