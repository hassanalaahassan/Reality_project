import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
})
export class ProfileInfoComponent {
  @Input() fullName = '';
  @Input() email = '';
  @Input() phone = '';
  @Input() isAgent = false;
  @Input() memberSince = '';
}
