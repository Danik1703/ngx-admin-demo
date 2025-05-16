import { Component, OnInit } from '@angular/core';
import { CoinGeckoService } from 'src/app/services/coin-gecko.service';
import { PlatformHelper } from '@natec/mef-dev-platform-connector';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.css']
})
export class CoinListComponent implements OnInit {
  coins: any[] = [];
  searchTerm: string = '';
  selectedCoinId: string | null = null;
  previousPrices: { [key: string]: number } = {};

  reviews: { text: string, rating: number }[] = [];
  reviewText: string = '';
  reviewRating: number = 5;

  usdToEur: number = 0.92;
  usdToUah: number = 39.5;

  Math = Math;

  isLoading: boolean = false;

  constructor(private coinGeckoService: CoinGeckoService) {}

  ngOnInit(): void {
    this.loadCoins();
    setInterval(() => this.loadCoins(), 60000);
  }

  loadCoins(): void {
    this.isLoading = true;
    this.coinGeckoService.getCoins().subscribe(
      (data: any[]) => {
        data.forEach(coin => {
          if (this.previousPrices[coin.id] === undefined) {
            this.previousPrices[coin.id] = coin.current_price;
          }
        });

        this.coins = data.slice(0, 8); 
        this.isLoading = false;
      },
      (error) => {
        console.error('Ошибка загрузки данных:', error);
        this.isLoading = false;
      }
    );
  }

  getAsset(url: string): string {
    return PlatformHelper.getAssetUrl() + url;
  }

  filterCryptocurrencies(): any[] {
    return this.coins.filter(coin =>
      coin.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectCoin(coinId: string): void {
    this.selectedCoinId = coinId;
  }

  searchCoins(): void {
    this.coinGeckoService.searchCoins(this.searchTerm).subscribe((data: any) => {
      this.coins = data.coins;
    });
  }

  getPriceChangeClass(coin: any): string {
    const previousPrice = this.previousPrices[coin.id];
    if (previousPrice === undefined) {
      return '';
    }

    if (coin.price_change_percentage_24h > 0) {
      return 'price-up';
    } else if (coin.price_change_percentage_24h < 0) {
      return 'price-down';
    } else {
      return '';
    }
  }

  convertCurrency(priceUsd: number, currency: string): string {
    switch (currency) {
      case 'UAH':
        return (priceUsd * this.usdToUah).toFixed(2) + ' грн';
      default:
        return '$' + priceUsd.toFixed(2);
    }
  }
}
