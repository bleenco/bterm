import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface WindowSize {
  width: number;
  height: number;
}

@Injectable()
export class WindowService {
  size: BehaviorSubject<WindowSize>;

  constructor() {
    this.size = new BehaviorSubject<WindowSize>(this.getWindowSize());
    fromEvent(window, 'resize')
      .pipe(
        map((): WindowSize => this.getWindowSize()),
        distinctUntilChanged()
      )
      .subscribe(this.size);
  }

  getWindowSize(): WindowSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}

