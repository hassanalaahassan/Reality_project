import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  computed,
  input,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-property-info',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, RouterLink],
  templateUrl: './property-info.component.html',
  styleUrls: ['./property-info.component.scss'],
})
export class PropertyInfoComponent {
  @Input() title: string = '';
  @Input() location: string = '';
  @Input() price: number | null = null;
  @Input() isNegotiable: boolean = false;
  @Input() area: string = '';
  @Input() beds: number | null = null;
  @Input() bathroom: number | null = null;
  @Input() floor: number | null = null;
  @Input() description: string = '';
  @Input() features: string[] = [];
  @Input() ownerName: string = '';
  @Input() ownerPhone: string = '';
  userId = input<string>('');
  id = input<string>('');
  @Output() deleteClick = new EventEmitter<void>();
  private auth = inject(AuthService);

  canUpdate = computed(
    () => this.auth.currentUser()?.auth.id === this.userId(),
  );

  isDescriptionExpanded = signal<boolean>(false);

  toggleDescription() {
    this.isDescriptionExpanded.update((v) => !v);
  }
}
