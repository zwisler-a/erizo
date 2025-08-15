// image-cropper.component.ts
import {
  Component, ElementRef, ViewChild, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import 'cropperjs';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

type Positive = number;

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, MatIconButton, MatIcon, MatButton],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageCropperComponent implements OnChanges {
  @Input({required: true}) srcDataUri: string | undefined = undefined;    // e.g. data:image/png;base64,...
  @Input() aspectRatio?: Positive;                                 // > 0 → fixed ratio
  @Output() croppedDataUri = new EventEmitter<string>();           // full data URI

  @ViewChild('image', {read: ElementRef}) private imageEl?: ElementRef<any>;
  @ViewChild('sel', {read: ElementRef}) private selEl?: ElementRef<any>;

  safeSrc!: SafeUrl | null;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['srcDataUri']) {
      this.safeSrc = this.srcDataUri ? this.sanitizer.bypassSecurityTrustUrl(this.srcDataUri) : null;
      queueMicrotask(() => this.applyAspectRatio());
    }
    if (changes['aspectRatio']) {
      queueMicrotask(() => this.applyAspectRatio());
    }
  }

  private applyAspectRatio(): void {
    const sel = this.selEl?.nativeElement;
    if (!sel) return;
    sel.aspectRatio = (typeof this.aspectRatio === 'number' && isFinite(this.aspectRatio) && this.aspectRatio > 0)
      ? this.aspectRatio
      : Number.NaN;
    sel.$render?.();
  }

  async crop(): Promise<void> {
    const sel = this.selEl?.nativeElement;
    if (!sel) return;
    const canvas: HTMLCanvasElement = await sel.$toCanvas?.({});
    this.croppedDataUri.emit(canvas.toDataURL());
  }

  zoom(d: number): void {
    console.log('zoom', d, this.selEl?.nativeElement);
    this.imageEl?.nativeElement?.$zoom?.(d);
  }

  rotate(deg: number): void {
    this.imageEl?.nativeElement?.$rotate?.(`${deg}deg`);
  }

  reset(): void {
    this.selEl?.nativeElement?.$reset?.();
  }

  cancel() {
    if (!this.srcDataUri) return;
    this.croppedDataUri.next(this.srcDataUri);
  }
}
