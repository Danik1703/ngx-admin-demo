import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-coin-search',
  templateUrl: './coin-search.component.html',
  styleUrls: ['./coin-search.component.css']
})
export class CoinSearchComponent {
  @Output() search = new EventEmitter<string>();
  query: string = '';

  onSearch(): void {
    this.search.emit(this.query);
  }
}
