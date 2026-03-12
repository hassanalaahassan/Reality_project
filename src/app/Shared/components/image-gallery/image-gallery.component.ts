import { Component, Input, Output, EventEmitter, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent {
  @Input() images: string[] = [];
  @Input() title: string = '';
  @Input() isVip: boolean = false;
  @Input() statusLabel: string | undefined = '';
  @Input() statusColor: string | undefined = '';
  @Input() isFavorite: boolean = false;

  @Output() toggleFavoriteEvent = new EventEmitter<void>();

  selectedImageIndex = signal<number>(0);
  isImageDialogOpen = signal<boolean>(false);
  imageAnimationKey = signal<number>(0);

  touchStartX = 0;
  touchEndX = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get currentImage(): string {
    if (!this.images || !this.images.length) return 'assets/images/default-property.jpg';
    return this.images[this.selectedImageIndex()] || this.images[0];
  }

  selectImage(index: number) {
    if (this.selectedImageIndex() !== index) {
      this.selectedImageIndex.set(index);
      this.imageAnimationKey.update(k => k + 1);
    }
  }

  openImageDialog(index?: number) {
    if (index !== undefined) this.selectedImageIndex.set(index);
    this.isImageDialogOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeImageDialog() {
    this.isImageDialogOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  nextImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.images && this.selectedImageIndex() < this.images.length - 1) {
      this.selectedImageIndex.update(i => i + 1);
      this.imageAnimationKey.update(k => k + 1);
    }
  }

  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.selectedImageIndex() > 0) {
      this.selectedImageIndex.update(i => i - 1);
      this.imageAnimationKey.update(k => k + 1);
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50;
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.nextImage();
    }
    if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.prevImage();
    }
  }

  onToggleFavorite() {
    this.toggleFavoriteEvent.emit();
  }
}
