import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapDisplayComponent } from '../map-display/map-display.component';

@Component({
  selector: 'app-property-map-box',
  standalone: true,
  imports: [CommonModule, MapDisplayComponent],
  templateUrl: './property-map-box.component.html',
  styleUrls: ['./property-map-box.component.scss']
})
export class PropertyMapBoxComponent {
  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() height: string = '220px';
  @Input() zoom: number = 15;
}
