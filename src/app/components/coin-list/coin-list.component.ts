import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { CoinGeckoService } from 'src/app/services/coin-gecko.service';
import { PlatformHelper } from '@natec/mef-dev-platform-connector';

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.css']
})
export class CoinListComponent implements OnInit, AfterViewChecked {
  coins: any[] = [];
  searchTerm = '';
  selectedCoinId: string | null = null;
  isLoading = false;
  private sparklineDrawn = new Set<string>();

  private currencyRates = {
    USD_TO_EUR: 0.92,
    USD_TO_UAH: 39.5
  };

  constructor(
    private coinGeckoService: CoinGeckoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCoins();
    setInterval(() => this.loadCoins(), 60000);
  }

  ngAfterViewChecked(): void {
    this.drawAllSparklines();
  }

  loadCoins(): void {
    this.isLoading = true;
    this.coinGeckoService.getCoins().subscribe({
      next: (data: any[]) => {
        this.coins = data.slice(0, 8);
        this.sparklineDrawn.clear();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAsset(url: string): string {
    return PlatformHelper.getAssetUrl() + url;
  }

  filterCryptocurrencies(): any[] {
    const term = this.searchTerm.toLowerCase();
    return this.coins.filter(coin => coin.name.toLowerCase().includes(term));
  }

  selectCoin(coinId: string): void {
    this.selectedCoinId = coinId;
  }

  searchCoins(): void {
    if (!this.searchTerm.trim()) return;

    this.isLoading = true;
    this.coinGeckoService.searchCoins(this.searchTerm).subscribe(data => {
      this.coins = data.coins;
      this.sparklineDrawn.clear();
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  getPriceChangeClass(coin: any): string {
    if (coin.price_change_percentage_24h > 0) return 'price-up';
    if (coin.price_change_percentage_24h < 0) return 'price-down';
    return '';
  }

  convertCurrency(priceUsd: number, currency: string): string {
    switch (currency.toUpperCase()) {
      case 'UAH':
        return `${(priceUsd * this.currencyRates.USD_TO_UAH).toFixed(2)} грн`;
      case 'EUR':
        return `€${(priceUsd * this.currencyRates.USD_TO_EUR).toFixed(2)}`;
      default:
        return `$${priceUsd.toFixed(2)}`;
    }
  }

  drawAllSparklines(): void {
    this.coins.forEach(coin => {
      if (!this.sparklineDrawn.has(coin.id)) {
        this.drawSparkline(coin);
        this.sparklineDrawn.add(coin.id);
      }
    });
  }

  private drawSparkline(coin: any): void {
    const canvas = document.querySelector<HTMLCanvasElement>(`#sparkline-${coin.id}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prices: number[] = coin.sparkline_in_7d?.price || [];
    if (!prices.length) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00d68f';
    ctx.shadowColor = 'rgba(0, 214, 143, 0.4)';
    ctx.shadowBlur = 6;

    prices.forEach((price, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((price - minPrice) / (maxPrice - minPrice)) * height;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  calculateProgress(value: number): number {
    return Math.min(Math.max(((value + 20) / 40) * 100, 0), 100);
  }
}
