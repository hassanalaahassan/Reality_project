import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notfound',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss'
})
export class NotfoundComponent {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
