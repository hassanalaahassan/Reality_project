import { Component, Input, OnInit, ElementRef, ViewChild, OnDestroy, Inject, PLATFORM_ID, OnChanges, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../Services/map.service';

@Component({
  selector: 'app-map-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-display.component.html',
  styleUrl: './map-display.component.scss'
})
export class MapDisplayComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  @Input() latitude: number = 30.0444; // Default to Cairo
  @Input() longitude: number = 31.2357;
  @Input() zoom: number = 15;
  @Input() height: string = '300px';

  private map: any;
  private marker: any;
  private L: any;
  private resizeObserver: any;

  constructor(
    private mapService: MapService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initMap();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map && this.marker && (changes['latitude'] || changes['longitude'])) {
        this.updateMapPosition();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private async initMap() {
    this.L = await this.mapService.initLeaflet();
    if (!this.L) return;

    this.map = this.L.map(this.mapElement.nativeElement, {
      scrollWheelZoom: false, // Prevent accidental scrolling in details view
      dragging: !this.L.Browser.mobile // Disable dragging on mobile to allow page scrolling
    }).setView([this.latitude, this.longitude], this.zoom);

    this.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    this.marker = this.L.marker([this.latitude, this.longitude]).addTo(this.map);

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      this.resizeObserver = new (window as any).ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      this.resizeObserver.observe(this.mapElement.nativeElement);
    }
  }

  private updateMapPosition() {
    if (this.map && this.marker && this.latitude && this.longitude) {
       this.map.setView([this.latitude, this.longitude], this.zoom);
       this.marker.setLatLng([this.latitude, this.longitude]);
    }
  }

  public invalidateSize() {
      if (this.map) {
         setTimeout(() => this.map.invalidateSize(), 100);
      }
  }
}
