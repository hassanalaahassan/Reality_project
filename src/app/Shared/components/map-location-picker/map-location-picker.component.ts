import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  ViewChild,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MapService, LocationResult } from '../../../Services/map.service';

@Component({
  selector: 'app-map-location-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-location-picker.component.html',
  styleUrl: './map-location-picker.component.scss',
})
export class MapLocationPickerComponent implements OnInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  @Input() initialLat: number = 30.0444;
  @Input() initialLng: number = 31.2357;
  @Input() initialZoom: number = 13;
  @Input() height: string = '400px';

  @Output() locationSelected = new EventEmitter<LocationResult>();

  private map: any;
  private marker: any;
  private L: any;

  constructor(
    private mapService: MapService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initMap();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private async initMap() {
    this.L = await this.mapService.initLeaflet();
    if (!this.L) return;

    this.map = this.L.map(this.mapElement.nativeElement).setView(
      [this.initialLat, this.initialLng],
      this.initialZoom,
    );

    this.L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    ).addTo(this.map);

    this.marker = this.L.marker([this.initialLat, this.initialLng], {
      draggable: true,
    }).addTo(this.map);

    // Handle map click
    this.map.on('click', (e: any) => {
      this.reverseGeocode(this.L, e.latlng.lat, e.latlng.lng);
    });

    // Handle marker drag
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.reverseGeocode(this.L, position.lat, position.lng);
    });
  }

  searchLocation(query: string) {
    if (!query) return;
    if (!this.L || !this.map) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=eg&accept-language=en`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          const result = results[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          if (result.boundingbox) {
            const bounds = this.L.latLngBounds(
              this.L.latLng(
                parseFloat(result.boundingbox[0]),
                parseFloat(result.boundingbox[2]),
              ),
              this.L.latLng(
                parseFloat(result.boundingbox[1]),
                parseFloat(result.boundingbox[3]),
              ),
            );
            this.map.fitBounds(bounds, { animate: true, maxZoom: 16 });
          } else {
            this.map.setView([lat, lng], 14, { animate: true });
          }

          this.updateMarkerAndEmit(
            lat,
            lng,
            result.display_name || result.name,
          );
        } else {
        }
      },
      error: (e) => {
        console.error('Error fetching data from Nominatim:', e);
      },
    });
  }

  private reverseGeocode(L: any, lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`;
    this.http.get<any>(url).subscribe({
      next: (result) => {
        let address = 'Selected Location';
        if (result && result.display_name) {
          address = result.display_name;
        }
        this.updateMarkerAndEmit(lat, lng, address);
      },
      error: (e) => {
        console.error('Error reverse geocoding:', e);
        this.updateMarkerAndEmit(lat, lng, 'Selected Location');
      },
    });
  }

  private updateMarkerAndEmit(lat: number, lng: number, address: string) {
    this.marker.setLatLng([lat, lng]);
    this.locationSelected.emit({ lat, lng, address });
  }

  public invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 100);
    }
  }
}
