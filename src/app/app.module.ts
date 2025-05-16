import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { AppComponent } from './app.component';
import { CoinChartComponent } from './components/coin-chart/coin-chart.component';  
import { CoinListComponent } from './components/coin-list/coin-list.component';
import { CoinSearchComponent } from './components/coin-search/coin-search.component';
import { CoinGeckoService } from './services/coin-gecko.service';
import { AppRoutingModule } from './app-routing.module';  
import { HttpClientModule } from '@angular/common/http';
import { NbBadgeModule } from '@nebular/theme';
import { NgxEchartsModule } from 'ngx-echarts';





import {
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbMenuModule,
  NbFormFieldModule,
  NbInputModule,
  NbIconModule,
  NbCardModule,
  NbDialogModule,
  NbSelectModule,
  NbListModule,
  NbSpinnerModule,
  NbAlertModule,
} from '@nebular/theme';

import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbSecurityModule } from '@nebular/security';  

import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [
    AppComponent,
    CoinListComponent,
    CoinChartComponent,
    CoinSearchComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    NgChartsModule,
    AppRoutingModule,
    HttpClientModule,

    NbBadgeModule,
    NbCardModule,
    NbDialogModule.forRoot(),  
    NbSelectModule,
    NbListModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NbThemeModule.forRoot({ name: 'corporate' }),
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbButtonModule,
    NbMenuModule.forRoot(),
    NbEvaIconsModule,
    NbSecurityModule.forRoot({
      accessControl: {
        guest: {
          view: ['public'],
        },
        user: {
          parent: 'guest',
          view: ['user'],
          create: ['user'],
          edit: ['user'],
          remove: ['user'],
        },
      },
    }),

    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    OverlayModule,
    NbSpinnerModule,
    NbAlertModule,
    
  ],
  providers: [CoinGeckoService],
  bootstrap: [AppComponent],
})
export class AppModule { }
