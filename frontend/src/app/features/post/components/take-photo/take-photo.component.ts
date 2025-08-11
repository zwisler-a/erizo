import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {CameraPreview, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import {UploadPostJourneyService} from '../../services/upload-post-journey.service';
import {FilePicker} from '@capawesome/capacitor-file-picker';
import {Capacitor} from '@capacitor/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ERROR_SNACKBAR} from '../../../../util/snackbar-consts';

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

  private W = window.innerWidth;
  private H = Math.round(this.W * 4 / 3);

  constructor(private postJourney: UploadPostJourneyService, private snackbar: MatSnackBar) {
  }


  async startCamera() {
    CameraPreview.start({
      parent: 'cameraPreview',
      width: this.W, height: this.H,
      x: 0,
      y: Math.round((window.innerHeight - this.H)/2),
      enableZoom: true,
      toBack: true
    });
  }

  async takePhoto() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90, width: this.W, height: this.H,
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
    if (Capacitor.getPlatform() === 'web') {
      this.snackbar.open("Sorry, implementing this on the web is too much of a headache ...", "OK", ERROR_SNACKBAR);
    } else {
      await CameraPreview.flip();
    }
  }

  async uploadPhoto() {
    const result = await FilePicker.pickMedia({
      readData: true,
      limit: 1
    });

    if (result.files.length > 0) {
      const file = result.files[0];
      if (file.mimeType.startsWith('image/')) {
        this.postJourney.setPhoto(`data:${file.mimeType};base64,${file.data}`);
      } else if (file.mimeType.startsWith('video/')) {
        const base64Video = `data:${file.mimeType};base64,${file.data}`;
        this.postJourney.setVideo(base64Video);
      }
    }
  }

}
