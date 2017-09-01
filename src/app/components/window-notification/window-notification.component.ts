import { Component, OnInit, NgZone } from '@angular/core';
import { HtermService, IResizeGeom } from '../../services/hterm.service';

@Component({
  selector: 'window-notification',
  templateUrl: 'window-notification.component.html'
})
export class WindowNotificationComponent implements OnInit {
  isVisible: boolean;
  notificationText: string;
  timeout: any;

  constructor(private hterm: HtermService, private zone: NgZone) {
    this.isVisible = false;
  }

  ngOnInit() {
    this.hterm.resizeEvents.subscribe((data: IResizeGeom) => {
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
