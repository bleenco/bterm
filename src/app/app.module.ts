import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlimScrollModule } from 'ng2-slimscroll';
import { XtermServiceProvider } from './services/xterm.service';
import { PTYServiceProvider } from './services/pty.service';
import { ConfigServiceProvider } from './services/config.service';
import { SearchServiceProvider } from './services/search.service';
import { GITServiceProvider } from './services/git.service';
import { AppComponent } from './app.component';
import { WindowTopComponent } from './components/window-top';
import { WindowTerminalComponent } from './components/window-terminal';
import { WindowBottomComponent } from './components/window-bottom';
import { WindowSidebarComponent } from './components/window-sidebar';
import { WindowNotificationComponent } from './components/window-notification';
import { SystemServiceProvider } from './services/system.service';

@NgModule({
  declarations: [
    AppComponent,
    WindowTopComponent,
    WindowTerminalComponent,
    WindowBottomComponent,
    WindowSidebarComponent,
    WindowNotificationComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    SlimScrollModule
  ],
  providers: [
    ConfigServiceProvider,
    XtermServiceProvider,
    PTYServiceProvider,
    SearchServiceProvider,
    GITServiceProvider,
    SystemServiceProvider
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
