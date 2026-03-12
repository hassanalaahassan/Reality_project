import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
})
export class ProfileHeaderComponent {
  @Input() fullName = '';
  @Input() email = '';
  @Input() imageUrl = '';
  @Input() isAgent = false;
  @Input() isUploading = false;

  @Output() avatarChange = new EventEmitter<File>();

  onAvatarSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.avatarChange.emit(input.files[0]);
    }
  }
}
