import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import { CITY_DATA, City } from '../components/city-data';
import { from } from 'rxjs';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map-chart.component.html',
  styleUrls: ['./map-chart.component.css']
})
export class MapChartComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  selectedCityIndex = 0;
  cities: City[] = CITY_DATA;
  markers: L.Marker[] = [];

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  initMap(): void {
    this.map = L.map('map', {
      center: this.cities[0].coords,
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '© Stadia Maps, © OpenMapTiles © OpenStreetMap',
    }).addTo(this.map);

    this.addMarkers();
  }

  getMarkerIcon(selected: boolean) {
    return L.divIcon({
      className: 'ngx-admin-marker',
      html: `<span class="marker-pin${selected ? ' selected' : ''}"></span>`,
      iconSize: selected ? [40, 56] : [30, 42],
      iconAnchor: selected ? [20, 56] : [15, 42],
    });
  }

  addMarkers(): void {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    this.cities.forEach((city, i) => {
      const marker = L.marker(city.coords, {
        icon: this.getMarkerIcon(i === this.selectedCityIndex),
      }).addTo(this.map);

      marker.bindPopup(
        `<nb-card class="popup-card" size="tiny" status="info">
          <nb-card-header>${city.name}</nb-card-header>
          <nb-card-body>
            <div>Bitcoin: ${city.bitcoin}</div>
            <div>Ethereum: ${city.ethereum}</div>
          </nb-card-body>
        </nb-card>`
      );

      marker.on('click', () => {
        if (this.selectedCityIndex !== i) {
          this.selectedCityIndex = i;
          this.updateMarkers();
          this.map.flyTo(city.coords, 9, { duration: 1.5 });
          marker.openPopup();
        }
      });

      this.markers.push(marker);
    });

    this.markers[this.selectedCityIndex].openPopup();
  }

  selectCity(index: number): void {
    if (this.selectedCityIndex !== index) {
      this.selectedCityIndex = index;
      const city = this.cities[index];
      this.updateMarkers();
      this.map.flyTo(city.coords, 9, { duration: 1.2 });
    }
  }

  updateMarkers(): void {
    this.markers.forEach((marker, i) => {
      marker.setIcon(this.getMarkerIcon(i === this.selectedCityIndex));
      if (i === this.selectedCityIndex) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    });
  }
}
