import { Component, OnInit, NgZone } from '@angular/core';
import { XtermService, IResizeGeom } from '../../services/xterm.service';

@Component({
  selector: 'window-notification',
  templateUrl: 'window-notification.component.html'
})
export class WindowNotificationComponent implements OnInit {
  isVisible: boolean;
  notificationText: string;
  timeout: any;

  constructor(private xterm: XtermService, private zone: NgZone) {
    this.isVisible = false;
  }

  ngOnInit() {
    this.xterm.resizeEvents.subscribe((data: IResizeGeom) => {
      this.zone.run(() => {
        this.notificationText = `${data.col}:${data.row}`;
        this.isVisible = true;

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.isVisible = false;
        }, 1000);
      });
    });
  }
}
