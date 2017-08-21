import { Component, OnInit, Renderer, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { SlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { themes } from '../../themes';
import { IFonts, IUrlKeys, SystemService } from '../../services/system.service';
const electron = require('electron');
const dialog = electron.remote.dialog;

@Component({
  selector: 'window-sidebar',
  templateUrl: 'window-sidebar.component.html'
})
export class WindowSidebarComponent implements OnInit {
  menu: string;
  opened: boolean;
  scrollOptions: SlimScrollOptions;
  themeNames: string[];
  selectedTheme: string;
  availableFonts: IFonts[];
  availableShells: { shell: string, args: string[] }[];
  availableUrlKeys: IUrlKeys[];
  scrollEvents: EventEmitter<SlimScrollEvent>;

  constructor(
    private config: ConfigService,
    private _system: SystemService,
    private renderer: Renderer,
    private elementRef: ElementRef
  ) {
    this.availableFonts = [];
    this.availableShells = [];
    this.availableUrlKeys = this._system.getUrlKeys();

    this.menu = 'themes';
    this.scrollOptions = new SlimScrollOptions({
      barBackground: '#F2F2F2',
      gridBackground: '#F2F2F2',
      barBorderRadius: '10',
      barWidth: '6',
      gridWidth: '2',
      alwaysVisible: true
    });

    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
  }

  ngOnInit() {
    this.themeNames = Object.keys(themes);
    this.selectedTheme = this.config.config.settings['theme_name'];
    this._system.getFonts().then(f => this.availableFonts = f);
    this._system.getShells().then(s => this.availableShells = s);

    setTimeout(() => {
      [].forEach.call(this.elementRef.nativeElement.querySelectorAll('.theme-browser'), el => {
        this.renderer.setElementStyle(el, 'height', document.body.clientHeight - 130 + 'px');
      });
    });

    this.recalculateScrollbar();
  }

  setFont(font: IFonts) { this.config.setFont(font); }
  setShell(shell: { shell: string, args: string[] }) { this.config.setShell(shell); }
  setUrlKey(key: IUrlKeys) { this.config.setUrlKey(key); }

  previewTheme(theme: string): void {
    let styles = { style: themes[theme] };
    this.config.previewTheme(styles, theme);
    this.selectedTheme = theme;
  }

  openSidebar(): void {
    this.opened = true;
    this.config.setSidebarConfig();
  }

  closeSidebar(): void {
    this.opened = false;
    this.config.setSidebarConfig();
  }

  setMenu(e: MouseEvent, menu: string): void {
    e.preventDefault();
    e.stopPropagation();

    this.menu = menu;
    this.config.setSidebarConfig();

    setTimeout(() => {
      [].forEach.call(this.elementRef.nativeElement.querySelectorAll('.theme-browser'), el => {
        this.renderer.setElementStyle(el, 'height', document.body.clientHeight - 130 + 'px');
      });

      this.recalculateScrollbar();
    });
  }

  @HostListener('window:resize', ['$event']) private onResize(e) {
    [].forEach.call(this.elementRef.nativeElement.querySelectorAll('.theme-browser'), el => {
      this.renderer.setElementStyle(el, 'height', document.body.clientHeight - 130 + 'px');
    });

    this.recalculateScrollbar();
  }

  recalculateScrollbar(): void {
    const event: SlimScrollEvent = {
      type: 'recalculate',
      easing: 'linear'
    };

    setTimeout(() => this.scrollEvents.emit(event));
  }
}
