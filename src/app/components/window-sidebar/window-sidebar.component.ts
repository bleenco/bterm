import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { SlimScrollOptions } from 'ng2-slimscroll';
import { themes } from '../../themes';

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

  constructor(private config: ConfigService) {
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
  }

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
}
