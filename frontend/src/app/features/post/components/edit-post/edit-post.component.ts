import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatFormField} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {UploadPostJourneyService} from '../../services/upload-post-journey.service';
import {MatMenuModule} from '@angular/material/menu';
import {ImageCropperComponent} from '../image-cropper/image-cropper.component';

@Component({
  selector: 'app-edit-post',
  imports: [
    MatIcon,
    MatIconButton,
    MatFormField,
    MatInputModule,
    FormsModule,
    NgIf,
    MatProgressSpinner,
    MatMenuModule,
    ImageCropperComponent
  ],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css'
})
export class EditPostComponent {


  @ViewChild('image') image!: ElementRef<HTMLImageElement>;
  loading: boolean = false;
  shouldCrop = false;

  constructor(public uploadJourney: UploadPostJourneyService) {
  }


  nextCounter() {
    if (this.uploadJourney.deleteAfter == undefined) {
      this.uploadJourney.deleteAfter = 1;
    } else {
      this.uploadJourney.deleteAfter++;
    }

    if (this.uploadJourney.deleteAfter >= 4) {
      this.uploadJourney.deleteAfter = undefined;
    }
  }

  retakePhoto() {
    this.uploadJourney.retakePhoto();
  }


  imageSrc: string = 'YOUR_BASE64_IMAGE'; // Your base64 image string


  private createCanvas(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image not found');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  private updateImageFromCanvas(canvas: HTMLCanvasElement): void {
    this.uploadJourney.previewPhoto = canvas.toDataURL();
  }

  flipX() {
    const img = this.image.nativeElement;
    const canvas = this.createCanvas(img);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(img, -canvas.width, 0);
    ctx.restore();

    this.updateImageFromCanvas(canvas);
  }

  flipY() {
    const img = this.image.nativeElement;
    const canvas = this.createCanvas(img);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(1, -1); // Flip vertically
    ctx.drawImage(img, 0, -canvas.height);
    ctx.restore();

    this.updateImageFromCanvas(canvas);
  }

  rotateLeft() {
    const img = this.image.nativeElement;
    const canvas = this.createCanvas(img);
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2); // Rotate 90° counterclockwise
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    this.updateImageFromCanvas(canvas);
  }

  rotateRight() {
    const img = this.image.nativeElement;
    const canvas = this.createCanvas(img);
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2); // Rotate 90° clockwise
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    this.updateImageFromCanvas(canvas);
  }

  async complete() {
    this.loading = true;

    try {
      await this.uploadJourney.complete();
    } catch (error) {
      throw error;
    } finally {
      this.loading = false;
    }
  }

  updateImage(image: string) {
    this.uploadJourney.previewPhoto = image;
    this.shouldCrop = false;
  }
}
