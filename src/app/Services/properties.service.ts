import { Injectable, computed, inject, signal } from '@angular/core';
import { SubabaseService } from '../core/subabase.service';
import { Property, PropertyForm } from '../Models/property';
import { Observable, forkJoin, map, from, switchMap, tap, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PropertiesService {
  private supabase = inject(SubabaseService);
  private auth = inject(AuthService);
  propertiesList = computed(() => Array.from(this.propertiesMap().values()));
  favoriteProperties = computed(() => {
    const fav = this.favoriteIds();

    return Array.from(this.propertiesMap().values()).filter((p) =>
      fav.has(p.id+""),
    );
  });
  private propertiesMap = signal<Map<string, Property>>(new Map());
  favoriteIds = signal<Set<string>>(new Set());

  addPropertyToMap(property: Property) {
    this.propertiesMap.update((currentMap) => {
      const newMap = new Map(currentMap);
      newMap.set(property.id + '', property);
      return newMap;
    });
  }
  getPropertyFromMap(id: string) {
    return this.propertiesMap().get(id);
  }
  removePropertyFromMap(id: string) {
    this.propertiesMap.update((map) => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
  }
  setPropertiesToMap(properties: Property[]) {
    this.propertiesMap.update(() => {
      return new Map(properties.map((p) => [p.id + '', p]));
    });
  }
  // Upload multiple images to 'properties' bucket
  uploadPropertyImages(files: File[]): Observable<string[]> {
    if (!files || files.length === 0) {
      return from([[]]);
    }

    // Generate a unique folder for this batch to avoid naming collisions
    const batchId = Date.now().toString();

    const uploadObservables = files.map((file) => {
      // Normalize filename slightly to prevent issues with spaces/special characters
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${batchId}/${cleanFileName}`;

      return this.supabase.uploadFile('properties_image', fileName, file).pipe(
        map((uploadRes) => {
          if (uploadRes.error) throw uploadRes.error;
          // Get public URL immediately
          return this.supabase.getFileUrl('properties_image', fileName).data
            .publicUrl;
        }),
      );
    });

    return forkJoin(uploadObservables);
  }

  // Add the property object to 'properties' table
  addProperty(property: PropertyForm): Observable<Property> {
    return this.supabase.insert<PropertyForm>('properties', property);
  }

  // Fetch all properties from the 'properties' table
  getProperties(): Observable<void> {
    return this.supabase.getAll<any>('properties').pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        this.setPropertiesToMap(res.data as Property[]);
      }),
    );
  }
  getFavProperties() {
    return this.supabase
      .getById('fav_properties', this.auth.currentUser()?.auth.id!)
      .pipe(
        tap((res: any) => {
          if (res.error) throw res.error;
          this.favoriteIds.set(new Set(res.data.properties_id));
        }),
      );
  }

  // Delete a single image from Supabase storage by its public URL
  deletePropertyImage(publicUrl: string): Observable<any> {
    const marker = '/properties_image/';
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) {
      return of(null);
    }
    const storagePath = publicUrl.substring(idx + marker.length);
    return this.supabase.deleteFile('properties_image', storagePath);
  }

  updateProperty(id: string, property: Partial<PropertyForm>) {
    const { id: _id, created_at: _ca, ...payload } = property as any;
    return this.supabase.update('properties', id, payload).pipe(
      map((res: any) => {
        if (res?.error) throw res.error;
        if (!res.data || res.data.length === 0) {
          throw new Error('Update failed: No matching property or permission denied by Supabase.');
        }
        const updated = res.data[0];
        return updated as Property;
      }),
      // After successful update, refetch ALL properties to sync the map
      switchMap((updatedProp: Property) => {
        return this.getProperties().pipe(map(() => updatedProp));
      })
    );
  }

  deleteProperty(id: string) {
    return this.supabase.delete('properties', id).pipe(
      map((res: any) => {
        if (res?.error) throw res.error;
        if (!res.data || res.data.length === 0) {
          throw new Error('Delete failed: No matching property or permission denied by Supabase.');
        }
        return res;
      }),
      // After successful delete, refetch ALL properties to sync the map
      switchMap(() => {
        this.removePropertyFromMap(id);
        return this.getProperties();
      })
    );
  }

  toggleFavProperty(propertyId: string) {
    return this.supabase
      .rpc('toggle_favorite', { p_property: propertyId })
      .pipe(switchMap(() => this.getFavProperties()));
  }
}
