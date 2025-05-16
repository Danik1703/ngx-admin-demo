import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoinListComponent } from './components/coin-list/coin-list.component';
import { CoinChartComponent } from './components/coin-chart/coin-chart.component';
import { PlatformHelper } from  '@natec/mef-dev-platform-connector';


const routes: Routes = PlatformHelper.updatePluginsRoutes([
  {
    path: '',
    children: [
      {
        path: '',
        component: CoinListComponent
      },
      {
        path: 'coin/:id',
        component: CoinChartComponent
      }
    ]
  }
]);



@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],  
  exports: [RouterModule]  
})
export class AppRoutingModule { }
