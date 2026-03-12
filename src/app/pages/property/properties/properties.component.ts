import { Component, computed, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs';

import { CardComponent } from '../property-card/property-card.component';
import { PropertiesService } from '../../../Services/properties.service';
import { PropertyFilterComponent } from '../../../Shared';
import { Property } from '../../../Models/property';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, CardComponent, PropertyFilterComponent],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  private propertiesService = inject(PropertiesService);

  @ViewChild(PropertyFilterComponent) filterComp!: PropertyFilterComponent;

  allProperties = computed(() => this.propertiesService.propertiesList());
  displayedProperties = signal<Property[]>([]);
  isLoading = signal<boolean>(true);
  favProperties = computed(() => this.propertiesService.favoriteIds());
  skeletonArray = new Array(6).fill(0);

  ngOnInit() {
    this.loadProperties();
  }

  checkPropertyFav(id: string): boolean {
    return this.favProperties().has(id);
  }

  loadProperties() {
    this.isLoading.set(true);
    this.propertiesService
      .getProperties()
      .pipe(tap(() => this.propertiesService.getFavProperties().subscribe()))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          // Set initial display to all properties
          this.displayedProperties.set(this.allProperties());
        },
        error: (err: any) => {
          console.error('Failed to load properties', err);
          this.isLoading.set(false);
        },
      });
  }

  onToggleFavorite(propertyId: string) {
    this.propertiesService.toggleFavProperty(propertyId).subscribe();
  }

  onFiltered(filtered: Property[]) {
    this.displayedProperties.set(filtered);
  }
}
