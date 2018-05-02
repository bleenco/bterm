import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

export interface WindowSize {
  width: number;
  height: number;
}

@Injectable()
export class WindowService {
  size: BehaviorSubject<WindowSize>;

  constructor() {
    this.size = new BehaviorSubject<WindowSize>(this.getWindowSize());
    Observable.fromEvent(window, 'resize')
      .map((): WindowSize => this.getWindowSize())
      .distinctUntilChanged()
      .subscribe(this.size);
  }

  getWindowSize(): WindowSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}

