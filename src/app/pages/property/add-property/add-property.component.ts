import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';

import { PropertiesService } from '../../../Services/properties.service';
import { AuthService } from '../../../Services/auth.service';
import { ToastService } from '../../../Services/toast.service';
import { PropertyForm } from '../../../Models/property';
import { AuthValidator } from '../../../Services/validation.service';
import { MapLocationPickerComponent } from '../../../Shared';

interface FeatureRow {
  id: number;
  value: string;
}

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, MapLocationPickerComponent],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.scss'],
})
export class AddPropertyComponent {
  private propertiesService = inject(PropertiesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private validationService = inject(AuthValidator);
  private toast = inject(ToastService);

  form = signal<PropertyForm>({
    title: '',
    price: null,
    area: '',
    location: '',
    latitude: null,
    longitude: null,
    status: '',
    type: '',
    isVip: false,
    isNegotiable: false,
    ownerName: '',
    ownerPhone: '',
    image_urls: [],
    user_id: this.authService.currentUser()?.auth.id,
    floor: null,
    beds: null,
    bathroom: null,
    features: [],
    description: '',
  });

  // All errors (signal so template reacts)
  errors = signal<Partial<Record<keyof PropertyForm, string>>>({});

  // Touched fields (signal so template reacts)
  touched = signal<Record<string, boolean>>({});

  selectedFiles: File[] = [];
  isSubmitting = false;

  // Feature rows as signal<FeatureRow[]> with stable IDs → no flicker
  private featureCounter = 0;
  featureRows = signal<FeatureRow[]>([]);

  // Computed form validity
  isFormValid = computed(() => {
    const { valid } = this.validationService.validateProperty(this.form());
    return valid;
  });

  // trackBy for feature *ngFor — stable ID means Angular won't re-create DOM
  trackById(_index: number, row: FeatureRow): number {
    return row.id;
  }

  // ── Field updates ──────────────────────────────────
  updateField(field: keyof PropertyForm, value: any) {
    this.form.update((f) => ({ ...f, [field]: value }));
    this.touched.update((t) => ({ ...t, [field]: true }));
    this.runValidation();
  }

  onLocationSelected(event: import('../../../Services/map.service').LocationResult) {
    this.form.update((f) => ({ ...f, location: event.address, latitude: event.lat, longitude: event.lng }));
    this.touched.update((t) => ({ ...t, location: true }));
    this.runValidation();
  }

  private runValidation() {
    const { errors: allErrors } = this.validationService.validateProperty(
      this.form(),
    );
    const t = this.touched();
    // Show only errors for fields the user has touched
    const filtered: Partial<Record<keyof PropertyForm, string>> = {};
    for (const key in allErrors) {
      if (t[key]) (filtered as any)[key] = (allErrors as any)[key];
    }
    this.errors.set(filtered);
  }

  // ── Features ───────────────────────────────────────
  addFeatureInput() {
    this.featureRows.update((rows) => [
      ...rows,
      { id: this.featureCounter++, value: '' },
    ]);
  }

  updateFeatureValue(id: number, value: string) {
    // Update only the value of the matching row — other rows untouched → no re-render jank
    this.featureRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, value } : r)),
    );
    this.syncFeaturesToForm();
  }

  removeFeatureRow(id: number) {
    this.featureRows.update((rows) => rows.filter((r) => r.id !== id));
    this.syncFeaturesToForm();
  }

  private syncFeaturesToForm() {
    const features = this.featureRows()
      .map((r) => r.value.trim())
      .filter((v) => v !== '');
    this.form.update((f) => ({ ...f, features }));
    this.touched.update((t) => ({ ...t, features: true }));
    this.runValidation();
  }

  // ── Misc ───────────────────────────────────────────
  get isAgent(): boolean {
    return !!this.authService.currentUser()?.profile?.isAgent;
  }

  onFileSelect(event: any) {
    if (event.target.files?.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit() {
    this.syncFeaturesToForm();

    // Mark ALL fields touched to show every error
    const allFields: (keyof PropertyForm)[] = [
      'title',
      'price',
      'area',
      'location',
      'status',
      'type',
      'ownerName',
      'ownerPhone',
      'floor',
      'beds',
      'bathroom',
      'features',
      'description',
    ];
    const allTouched: Record<string, boolean> = {};
    allFields.forEach((f) => (allTouched[f] = true));
    this.touched.set(allTouched);

    const { valid, errors } = this.validationService.validateProperty(
      this.form(),
    );
    this.errors.set(errors);

    if (!valid) {
      this.toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const data = this.form();

    this.propertiesService
      .uploadPropertyImages(this.selectedFiles)
      .pipe(
        switchMap((urls) =>
          this.propertiesService.addProperty({ ...data, image_urls: urls }),
        ),
        tap(() => {
          this.isSubmitting = false;
          this.toast.success('Property added successfully! 🎉');
          this.router.navigate(['/properties']);
        }),
        catchError((err) => {
          this.isSubmitting = false;
          const message =
            err?.error?.message ||
            err?.message ||
            'Failed to add property. Please try again.';
          this.toast.error(message);
          return of();
        }),
      )
      .subscribe();
  }
}
