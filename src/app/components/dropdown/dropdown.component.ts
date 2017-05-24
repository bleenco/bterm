import { Component, Inject, NgZone, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bterm-dropdown',
  templateUrl: 'dropdown.component.html'
})
export class DropdownComponent<T> implements OnInit {
  @Input('options') options: T[];
  @Input('selected') selected: T;
  @Output('onSelect') onSelect: EventEmitter<T>;
  @Input('defaultTitle') defaultTitle: string;

  title: string;

  current: T;

  constructor() {
    this.title = 'Select option';
    this.onSelect = new EventEmitter<T>();
  }

  ngOnInit() {
    if (typeof this.selected !== 'undefined') { this.select(this.selected); }
    if (typeof this.defaultTitle !== 'undefined') { this.title = this.defaultTitle; }
  }

  select(item: T) {
    this.onSelect.emit(item);
    this.current = item;
    this.title = item.toString() || 'No title';
  }

}
