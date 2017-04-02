import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { HtermService } from '../../services/hterm.service';
import { SearchService } from '../../services/search.service';

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
    @Inject(HtermService) private hterm: HtermService
  ) { }

  ngOnInit() {
    this.searchForm = new SearchForm();

    this.hterm.titleEvents.subscribe(event => {
      this.zone.run(() => {
        if (this.hterm.terminals[event.index] && event.index === this.hterm.currentIndex) {
          this.currentProcess = this.hterm.terminals[event.index].title;
          this.currentDir = this.hterm.terminals[event.index].dir;
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
