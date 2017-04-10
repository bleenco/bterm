import { Component, OnInit, NgZone } from '@angular/core';
import { HtermService } from '../../services/hterm.service';

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
    this.hterm.resizeEvents.subscribe(data => {
      this.zone.run(() => {
        this.notificationText = `${data.cols}:${data.rows}`;
        this.isVisible = true;

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.isVisible = false;
        }, 1000);
      });
    });
  }
}
