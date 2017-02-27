import { Injectable, Provider, Inject } from '@angular/core';
import { HtermService } from './hterm.service';

@Injectable()
export class SearchService {
  query: string;

  constructor(@Inject(HtermService) private hterm: HtermService) { }

  searchQuery(query: string) {
    this.reset();
    this.query = query;
    let term: any = this.hterm.terminals[this.hterm.currentIndex].term;
    let nodes = [...Array(term.getRowCount()).keys()].map(i => {
      let node: Node = term.getRowNode(i);
      let regexp = new RegExp(this.query, 'ig');
      let matches = node.firstChild.textContent.match(regexp);
      if (!matches) {
        return node;
      }

      matches.forEach(match => {
        console.log(match);
        let elHtml = `<span class="found" style="background: #FFFF00; color: #111111; border-radius: 1px;">${match}</span>`;
        node.firstChild.parentElement.innerHTML = node.firstChild.textContent.replace(match, elHtml);
      });

      return node;
    });

    this.replaceNodes(nodes);
  }

  reset() {
    let term: any = this.hterm.terminals[this.hterm.currentIndex].term;
    let nodes = [...Array(term.getRowCount()).keys()].map(i => term.getRowNode(i));
    nodes = nodes.map((node: Node) => {
      node.textContent = node.textContent.replace(/<span class="found"(.*)">(.*)<\/span>/ig, '$2');
      return node;
    });

    this.replaceNodes(nodes);
  }

  replaceNodes(nodes: Node[]): void {
    let term: any = this.hterm.terminals[this.hterm.currentIndex].term;
    term.scrollbackRows_ = nodes.splice(0, term.scrollbackRows_.length);
    term.screen_.rowsArray = nodes;
    term.scrollPort_.invalidate();
  }
}

export let SearchServiceProvider: Provider = {
  provide: SearchService, useClass: SearchService
};
