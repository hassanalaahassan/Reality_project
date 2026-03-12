import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.scss'],
})
export class ProfileEditFormComponent implements OnInit {
  @Input() fullName = '';
  @Input() phone = '';
  @Input() isSaving = false;

  @Output() save = new EventEmitter<{ fullName: string; phone: string }>();
  @Output() cancel = new EventEmitter<void>();

  editName = signal('');
  editPhone = signal('');

  ngOnInit() {
    this.editName.set(this.fullName);
    this.editPhone.set(this.phone);
  }

  onSave() {
    const name = this.editName().trim();
    const phone = this.editPhone().trim();
    if (!name) return;
    this.save.emit({ fullName: name, phone });
  }

  onCancel() {
    this.editName.set(this.fullName);
    this.editPhone.set(this.phone);
    this.cancel.emit();
  }
}
