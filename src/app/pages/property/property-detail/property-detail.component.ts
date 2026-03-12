import { Component, computed, inject, OnInit, signal, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Property } from '../../../Models/property';
import { PropertiesService } from '../../../Services/properties.service';
import {
  ImageGalleryComponent,
  PropertyInfoComponent,
  PropertyMapBoxComponent,
} from '../../../Shared';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ImageGalleryComponent,
    PropertyInfoComponent,
    PropertyMapBoxComponent,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private propertiesService = inject(PropertiesService);
  private platformId = inject(PLATFORM_ID);

  property = signal<Property | undefined>(undefined);
  isLoading = signal<boolean>(true);
  notFound = signal<boolean>(false);

  mapHeight = signal<string>('220px');

  isFavorite = computed(() => {
    return this.propertiesService.favoriteIds().has(this.property()?.id + '');
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    } else {
      this.isLoading.set(false);
      this.property.set(this.propertiesService.getPropertyFromMap(id));
    }

    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize() {
    this.mapHeight.set(window.innerWidth <= 768 ? '180px' : '220px');
  }

  toggleFavorite() {
    const prop = this.property();
    if (!prop) return;
    this.propertiesService.toggleFavProperty(this.property()?.id + '').subscribe();
  }

  getStatusLabel(status: string | undefined): string | undefined {
    if (status) {
      const labels: Record<string, string> = {
        sale: 'For Sale',
        rent: 'For Rent',
      };
      return labels[status?.toLowerCase()] || status;
    } else {
      return;
    }
  }

  getStatusColor(status: string | undefined): string | undefined {
    if (status) {
      const colors: Record<string, string> = {
        sale: 'status-sale',
        rent: 'status-rent',
      };
      return colors[status?.toLowerCase()] || '';
    } else {
      return;
    }
  }
}
