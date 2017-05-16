import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { XtermService } from '../../services/xterm.service';
import { SearchService } from '../../services/search.service';
import { platform } from 'os';

export class ISearchForm {
  query: string
};

export class SearchForm implements ISearchForm {
  query: string;

  constructor(obj?: ISearchForm) {
    this.query = obj && obj.query != null ? obj.query : '';
  }
}

@Component({
  selector: 'window-bottom',
  templateUrl: 'window-bottom.component.html'
})
export class WindowBottomComponent implements OnInit {
  searchForm: SearchForm;
  currentDir: string;
  currentProcess: string;

  constructor(
    @Inject(NgZone) private zone: NgZone,
    @Inject(SearchService) private search: SearchService,
    @Inject(XtermService) private xterm: XtermService
  ) { }

  ngOnInit() {
    this.searchForm = new SearchForm();

    if (platform() === 'win32') {
      return;
    }

    this.xterm.titleEvents.subscribe(event => {
      if (event.title === ':') {
        this.currentDir = null;
        return;
      }

      this.zone.run(() => {
        if (this.xterm.terminals[event.index] && event.index === this.xterm.currentIndex) {
          this.currentProcess = this.xterm.terminals[event.index].title;
          this.currentDir = this.xterm.terminals[event.index].dir;
        }
      });
    });
  }

  queryChanged() {
    if (this.searchForm.query.length > 2) {
      this.search.searchQuery(this.searchForm.query);
    } else {
      this.search.reset();
    }
  }
}
