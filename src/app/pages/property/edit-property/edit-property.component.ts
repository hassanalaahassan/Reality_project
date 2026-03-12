import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';

import { PropertiesService } from '../../../Services/properties.service';
import { AuthService } from '../../../Services/auth.service';
import { ToastService } from '../../../Services/toast.service';
import { PropertyForm } from '../../../Models/property';
import { AuthValidator } from '../../../Services/validation.service';
import { ConfirmationModalComponent } from '../../../Shared';

interface FeatureRow {
  id: number;
  value: string;
}

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  templateUrl: './edit-property.component.html',
  styleUrl: './edit-property.component.scss',
})
export class EditPropertyComponent implements OnInit {
  private route = inject(ActivatedRoute);
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
  isDeleteModalOpen = signal<boolean>(false);

  // Feature rows as signal<FeatureRow[]> with stable IDs → no flicker
  private featureCounter = 0;
  featureRows = signal<FeatureRow[]>([]);

  propertyId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    } else {
      this.propertyId.set(id);
      const existingProp = this.propertiesService.getPropertyFromMap(id);
      if (existingProp) {
        this.form.set(existingProp as PropertyForm);
        // Map existing features back to rows for the UI logic
        if (existingProp.features && existingProp.features.length > 0) {
          const rows = existingProp.features.map((f, i) => ({ id: i, value: f }));
          this.featureRows.set(rows);
          this.featureCounter = rows.length;
        }
      }
    }
  }

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

  // Location editing is disabled

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

  removeExistingImage(url: string) {
    // Delete from Supabase storage first
    this.propertiesService.deletePropertyImage(url).subscribe({
      next: () => {
        // Remove from local form array after successful storage deletion
        const currentUrls = this.form().image_urls || [];
        this.form.update((f) => ({
          ...f,
          image_urls: currentUrls.filter((u) => u !== url),
        }));
        this.touched.update((t) => ({ ...t, image_urls: true }));
        this.toast.success('Image removed successfully.');
      },
      error: (err) => {
        console.error('Failed to delete image from storage:', err);
        this.toast.error('Failed to remove image. Please try again.');
      }
    });
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  openDeleteModal() {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
  }

  onDelete() {
    const id = this.propertyId();
    if (!id) return;
    
    this.isSubmitting = true;
    this.propertiesService.deleteProperty(id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.toast.success('Property deleted successfully!');
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.closeDeleteModal();
        this.isSubmitting = false;
        this.toast.error('Failed to delete property.');
        console.error(err);
      }
    });
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
    const id = this.propertyId();

    if (!id) {
       this.isSubmitting = false;
       return;
    }

    // Strip non-updatable fields that leaked from Property into PropertyForm
    const { id: _id, created_at: _ca, ...cleanData } = data as any;

    this.propertiesService
      .uploadPropertyImages(this.selectedFiles)
      .pipe(
        switchMap((newUrls) => {
          // Combine old kept URLs and newly uploaded URLs
          const combinedUrls = [...(cleanData.image_urls || []), ...newUrls].filter(url => url);
          return this.propertiesService.updateProperty(id, { ...cleanData, image_urls: combinedUrls });
        }),
        tap(() => {
          this.isSubmitting = false;
          this.toast.success('Property updated successfully! 🎉');
          this.router.navigate(['/properties']);
        }),
        catchError((err) => {
          this.isSubmitting = false;
          const message =
            err?.error?.message ||
            err?.message ||
            'Failed to update property. Please try again.';
          this.toast.error(message);
          return of();
        }),
      )
      .subscribe();
  }
}
