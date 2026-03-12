import { Component, computed, Input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../Models/property';

export interface PropertyFilters {
  search: string;
  status: string;
  type: string;
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  minBeds: number | null;
  minBaths: number | null;
}

const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  status: '',
  type: '',
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  minBeds: null,
  minBaths: null,
};

@Component({
  selector: 'app-property-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-filter.component.html',
  styleUrls: ['./property-filter.component.scss'],
})
export class PropertyFilterComponent {
  @Input() set properties(val: Property[]) {
    this._properties.set(val);
  }

  @Output() filtered = new EventEmitter<Property[]>();

  private _properties = signal<Property[]>([]);
  isOpen = signal<boolean>(false);
  filters = signal<PropertyFilters>({ ...DEFAULT_FILTERS });

  filteredProperties = computed(() => {
    let list = this._properties();
    const f = this.filters();

    if (f.search) {
      const q = f.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }
    if (f.status) {
      list = list.filter((p) => p.status === f.status);
    }
    if (f.type) {
      list = list.filter((p) => (p as any).type === f.type);
    }
    if (f.priceMin != null) {
      list = list.filter((p) => (p.price ?? 0) >= f.priceMin!);
    }
    if (f.priceMax != null) {
      list = list.filter((p) => (p.price ?? 0) <= f.priceMax!);
    }
    if (f.areaMin != null) {
      list = list.filter((p) => parseFloat(p.area || '0') >= f.areaMin!);
    }
    if (f.areaMax != null) {
      list = list.filter((p) => parseFloat(p.area || '0') <= f.areaMax!);
    }
    if (f.minBeds != null) {
      list = list.filter((p) => (p.beds ?? 0) >= f.minBeds!);
    }
    if (f.minBaths != null) {
      list = list.filter((p) => (p.bathroom ?? 0) >= f.minBaths!);
    }

    return list;
  });

  activeFilterCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.search) count++;
    if (f.status) count++;
    if (f.type) count++;
    if (f.priceMin != null) count++;
    if (f.priceMax != null) count++;
    if (f.areaMin != null) count++;
    if (f.areaMax != null) count++;
    if (f.minBeds != null) count++;
    if (f.minBaths != null) count++;
    return count;
  });

  resultCount = computed(() => this.filteredProperties().length);

  toggle() {
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  updateFilter(key: keyof PropertyFilters, value: any) {
    this.filters.update((f) => ({
      ...f,
      [key]:
        value === ''
          ? key === 'search' || key === 'status' || key === 'type'
            ? ''
            : null
          : value,
    }));
    this.emitFiltered();
  }

  updateNumericFilter(key: keyof PropertyFilters, raw: string) {
    const num = raw ? parseFloat(raw) : null;
    this.filters.update((f) => ({ ...f, [key]: num }));
    this.emitFiltered();
  }

  clearFilters() {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.emitFiltered();
  }

  emitFiltered() {
    this.filtered.emit(this.filteredProperties());
  }

  /** Called from parent after properties load to emit initial unfiltered list */
  initialize() {
    this.emitFiltered();
  }
}
