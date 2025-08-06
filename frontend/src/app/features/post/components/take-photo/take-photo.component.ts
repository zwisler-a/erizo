import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {CameraPreview, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import {UploadPostJourneyService} from '../../services/upload-post-journey.service';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';

@Component({
  selector: 'app-take-photo',
  imports: [
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './take-photo.component.html',
  styleUrl: './take-photo.component.css',
})
export class TakePhotoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  stream!: MediaStream;

  constructor(private postJourney: UploadPostJourneyService) {
  }


  async startCamera() {
    CameraPreview.start({parent: 'cameraPreview',width:window.innerWidth, height: window.innerHeight ,disableAudio: true, toBack: true, lockAndroidOrientation: true});
  }

  async takePhoto() {
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

  uploadPhoto(): void {
    Camera.getPhoto({resultType: CameraResultType.DataUrl, source: CameraSource.Photos}).then((photo) => {
      if(!photo || !photo.dataUrl) return;
      this.postJourney.setPhoto(photo.dataUrl)
    })
  }

}
