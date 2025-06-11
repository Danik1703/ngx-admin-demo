import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoinGeckoService, CoinChartData } from 'src/app/services/coin-gecko.service';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Location } from '@angular/common';

@Component({
  selector: 'app-coin-chart',
  templateUrl: './coin-chart.component.html',
  styleUrls: ['./coin-chart.component.css'],
})
export class CoinChartComponent implements OnInit, OnDestroy {
  coinId: string = '';
  chartData: ChartData<'line'> = { datasets: [] };
  chartOptions: ChartOptions<'line'> = {};
  chartType: 'line' = 'line';
  loading = false;
  error: string | null = null;
  lastUpdated = '';
  selectedCurrency = 'usd';
  selectedPeriod = '24h';

  intervalId: any;
  chartRefreshInterval: any;

  constructor(
    private route: ActivatedRoute,
    private coinGeckoService: CoinGeckoService,
    private location: Location
  ) {}

  currencies = [
    { value: 'usd', label: 'USD' },
    { value: 'eur', label: 'EUR' },
    { value: 'uah', label: 'UAH' },
  ];

  periods = [
    { value: '1m', label: '1 хвилина' },
    { value: '24h', label: '24 години' },
    { value: '7d', label: 'Тиждень' },
    { value: '30d', label: 'Місяць' },
  ];

  ngOnInit(): void {
    this.setChartOptions();
    this.route.params.subscribe(params => {
      this.coinId = params['id'];
      this.loadChartData(); 
      this.startWaveAnimation(); 
    });

    this.intervalId = setInterval(() => {
      this.loadChartData(); 
    }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.chartRefreshInterval);
  }

 setChartOptions(): void {
  this.chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#222c55',
        titleColor: '#a4a9f8',
        bodyColor: '#e0e6ff',
        borderColor: '#4b5bdc',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          family: "'Roboto', sans-serif",
          size: 14,
          weight: '500',
        },
        bodyFont: {
          family: "'Roboto', sans-serif",
          size: 13,
          weight: '400',
        },
        callbacks: {
          title: () => '',
          label: (context) => `Ціна: ${context.parsed.y.toFixed(4)} ${this.selectedCurrency.toUpperCase()}`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: {
        tension: 0.4,
        borderColor: '#5a6ff0',
        borderWidth: 3,
        backgroundColor: 'rgba(90, 111, 240, 0.15)',
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 3,
        hoverBorderColor: '#7c8fff',
        backgroundColor: '#5a6ff0',
        hoverBackgroundColor: '#7c8fff',
      },
    },
  };
}


  onCurrencyChange(): void {
    this.setChartOptions();
    this.loadChartData();
  }

  onPeriodChange(): void {
    this.setChartOptions();
    this.loadChartData();
  }

  getDaysFromPeriod(period: string): number {
    switch (period) {
      case '1m': return 1 / 1440;
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      default: return 1;
    }
  }

  loadChartData(): void {
    this.loading = true;
    this.error = null;

    const days = this.getDaysFromPeriod(this.selectedPeriod);

    this.coinGeckoService
      .getCoinChartData(this.coinId, days, this.selectedCurrency)
      .subscribe({
        next: (data: CoinChartData) => {
          const values = data.prices.map((p: [number, number]) => p[1]);

          this.chartData = {
            labels: values.map((_, i) => i.toString()),
            datasets: [
              {
                label: '',
                data: values,
              },
            ],
          };

          this.lastUpdated = new Date().toLocaleString();
          this.loading = false;
        },
        error: () => {
          this.error = 'Помилка завантаження графіка';
          this.loading = false;
        },
      });
  }

  startWaveAnimation(): void {
    this.chartRefreshInterval = setInterval(() => {
      this.coinGeckoService
        .getCoinChartData(this.coinId, 1 / 1440, this.selectedCurrency)
        .subscribe({
          next: (data: CoinChartData) => {
            const newPrice = data.prices[data.prices.length - 1][1];

            const dataset = this.chartData.datasets[0]?.data as number[] || [];
            if (dataset.length > 40) dataset.shift();

            dataset.push(newPrice);

            this.chartData = {
              ...this.chartData,
              datasets: [...this.chartData.datasets],
              labels: dataset.map((_, i) => i.toString()),
            };

            this.lastUpdated = new Date().toLocaleString();
          },
        });
    }, 3000);
  }

  goBack(): void {
    this.location.back();
  }
}
