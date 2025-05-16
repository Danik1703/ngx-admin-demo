import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoinChartData {
  prices: [number, number][];
  market_caps?: [number, number][];
  total_volumes?: [number, number][];
}

@Injectable({
  providedIn: 'root'
})
export class CoinGeckoService {

  private apiUrl = 'https://api.coingecko.com/api/v3';

  constructor(private http: HttpClient) {}

  getCoins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/coins/markets`, {
      params: { vs_currency: 'usd' }
    });
  }
  
getCoinChartData(coinId: string, days: number = 1, currency: string = 'usd') {
  return this.http.get<CoinChartData>(`${this.apiUrl}/coins/${coinId}/market_chart`, {
    params: {
      vs_currency: currency,
      days: days.toString()
    }
  });
}

  searchCoins(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, {
      params: { query: query }
    });
  }
}
