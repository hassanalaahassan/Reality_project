import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { ToastService } from '../../Services/toast.service';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { ProfileEditFormComponent } from './profile-edit-form/profile-edit-form.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileInfoComponent,
    ProfileEditFormComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  user = this.authService.currentUser;
  isEditing = signal(false);
  isSaving = signal(false);
  isUploadingAvatar = signal(false);

  get memberSince(): string {
    const date = this.user()?.auth?.created_at;
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  toggleEdit() {
    this.isEditing.update((v) => !v);
  }

  onAvatarChange(file: File) {
    this.isUploadingAvatar.set(true);
    this.authService.updateAvatar(file).subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.toast.success('Avatar updated successfully!');
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.toast.error('Failed to update avatar.');
        console.error(err);
      },
    });
  }

  onSave(data: { fullName: string; phone: string }) {
    this.isSaving.set(true);
    this.authService.updateProfile(data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.toast.success('Profile updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error('Failed to update profile.');
        console.error(err);
      },
    });
  }

  onCancelEdit() {
    this.isEditing.set(false);
  }
}
