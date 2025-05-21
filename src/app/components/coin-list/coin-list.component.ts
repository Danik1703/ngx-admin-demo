import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CoinGeckoService } from 'src/app/services/coin-gecko.service';
import { PlatformHelper } from '@natec/mef-dev-platform-connector';
import * as L from 'leaflet';

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.css']
})
export class CoinListComponent implements OnInit, AfterViewInit {
  coins: any[] = [];
  searchTerm = '';
  selectedCoinId: string | null = null;
  previousPrices: Record<string, number> = {};
  isLoading = false;

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;
  private sparklineDrawn = new Set<string>();

  private mapConfig = {
    center: [20, 0] as [number, number],
    zoom: 2,
    tileLayerUrl: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2l0dGl2YW1wcHBwcHAiLCJhIjoiY21hcXYwNHVsMDM4bDJrczlvc3NvYXJ3aSJ9.bnFMMcgqXF78ZYvWw9SzQg',
    tileLayerOptions: {
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
      detectRetina: true
    }
  };

  private currencyRates = {
    USD_TO_EUR: 0.92,
    USD_TO_UAH: 39.5
  };

  constructor(private coinGeckoService: CoinGeckoService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadCoins();
    setInterval(() => this.loadCoins(), 60000);
  }

ngAfterViewInit(): void {
  this.initMap();
}

private initMap(): void {
  this.map = L.map('map', {
    center: this.mapConfig.center,
    zoom: this.mapConfig.zoom,
    scrollWheelZoom: true,     
    zoomControl: true,         
    attributionControl: false,
    dragging: true,
  });

  this.map.zoomControl.setPosition('topright');

  L.tileLayer(this.mapConfig.tileLayerUrl, this.mapConfig.tileLayerOptions).addTo(this.map);

  this.markersLayer = L.layerGroup().addTo(this.map);

  fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(res => res.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        style: {
          fillColor: '#f5f7fa',     
          weight: 1,
          color: '#d1d5db',           
          fillOpacity: 0.7,
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(feature.properties.name);
            layer.on('mouseover', () => layer.openPopup());
            layer.on('mouseout', () => layer.closePopup());
          }
        }
      }).addTo(this.map);
    })
    .catch(err => console.error('Ошибка загрузки GeoJSON:', err));
}

private createMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: '<div class="pulse"></div><div class="pin"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
}

private updateMarkers(): void {
  this.markersLayer.clearLayers();

  this.coins.forEach(coin => {
    if (coin?.location?.lat && coin?.location?.lng) {
      const marker = L.marker([coin.location.lat, coin.location.lng], { icon: this.createMarkerIcon() })
        .bindPopup(`<b>${coin.name}</b><br>Price: ${this.convertCurrency(coin.current_price, 'USD')}`);
      this.markersLayer.addLayer(marker);
    }
  });
}

  loadCoins(): void {
    this.isLoading = true;
    this.coinGeckoService.getCoins().subscribe({
      next: (data: any[]) => {
        data.forEach(coin => {
          this.previousPrices[coin.id] = coin.current_price;
        });

        this.coins = data.slice(0, 8);
        this.sparklineDrawn.clear();
        this.updateMarkers();
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

    this.coinGeckoService.searchCoins(this.searchTerm).subscribe(data => {
      this.coins = data.coins;
      this.sparklineDrawn.clear();
      this.cdr.detectChanges();
      this.updateMarkers();
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
    ctx.shadowBlur = 5;

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
