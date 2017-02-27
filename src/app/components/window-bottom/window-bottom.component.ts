import { Component, Inject, NgZone, OnInit } from '@angular/core';
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

  constructor(
    @Inject(NgZone) private zone: NgZone,
    @Inject(SearchService) private search: SearchService
  ) { }

  ngOnInit() {
    this.searchForm = new SearchForm();
  }

  queryChanged() {
    if (this.searchForm.query.length > 2) {
      this.search.searchQuery(this.searchForm.query);
    } else {
      this.search.reset();
    }
  }
}
