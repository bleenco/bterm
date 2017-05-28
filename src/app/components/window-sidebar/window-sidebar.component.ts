import { Component, OnInit } from '@angular/core';
import { ConfigService, IShellDef } from '../../services/config.service';
import { SlimScrollOptions } from 'ng2-slimscroll';
import { themes } from '../../themes';
import { IFonts, IUrlKeys, SystemService } from '../../services/system.service';

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
  availableShells: IShellDef[];
  availableUrlKeys: IUrlKeys[];

  constructor(private config: ConfigService, private _system: SystemService) {
    this.availableFonts = [];
    this.availableShells = [];
    this.availableUrlKeys = this._system.getUrlKeys();

    this.menu = 'themes';
    this.scrollOptions = new SlimScrollOptions({
      barBackground: '#666666',
      gridBackground: '#666666',
      barBorderRadius: '10',
      barWidth: '6',
      gridWidth: '2'
    });
  }

  ngOnInit() {
    this.themeNames = Object.keys(themes);
    this.selectedTheme = this.config.config.settings['theme_name'];
    this._system.getFonts().then(f => this.availableFonts = f);
    this._system.getShells().then(s => this.availableShells = s);
  }

  setFont(font: string) { this.config.setFont(font); }
  setShell(shell: IShellDef) { this.config.setShell(shell); }
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
  }
}
