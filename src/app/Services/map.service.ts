import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private L: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async initLeaflet(): Promise<any> {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.L) {
        // Use global L injected via CDN in index.html to avoid SSR/Vercel chunking issues
        this.L = (window as any).L;
        
        if (this.L) {
          // Fix leaflet default icon issue
        const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
        const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
        const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
        
        const iconDefault = this.L.icon({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        });
        
        this.L.Marker.prototype.options.icon = iconDefault;
        }
      }
      return this.L;
    }
    return null;
  }
}
