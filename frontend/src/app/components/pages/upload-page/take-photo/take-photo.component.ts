import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {UploadPostJourneyService} from '../upload-post-journey.service';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {CameraPreview, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';

@Component({
  selector: 'app-take-photo',
  imports: [
    MatIcon,
    MatIconButton
  ],
  templateUrl: './take-photo.component.html',
  styleUrl: './take-photo.component.css'
})
export class TakePhotoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  stream!: MediaStream;

  constructor(private postJourney: UploadPostJourneyService) {
  }


  async startCamera() {
    CameraPreview.start({parent: "cameraPreview", disableAudio: true, toBack: true, lockAndroidOrientation: true});
  }

  async takePhoto() {
    /*const videoEl = this.video.nativeElement;
    const canvasEl = document.createElement('canvas');
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const context = canvasEl.getContext('2d');
    context?.drawImage(videoEl, 0, 0);
    const base64Image = canvasEl.toDataURL('image/png');
    this.postJourney.setPhoto(base64Image);*/
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90,
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);

    this.postJourney.setPhoto(`data:image/jpeg;base64,${result.value}`);
  }

  stopCamera() {
    CameraPreview.stop();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  ngAfterViewInit(): void {
    this.startCamera();
  }

  async toggleCamera() {
    CameraPreview.flip();
  }

}
