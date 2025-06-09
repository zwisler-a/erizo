import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {QrCodeComponent} from 'ng-qrcode';
import {AsyncPipe} from '@angular/common';
import {KeyService} from '../../../../core/crypto/key.service';
import {UserService} from '../../../../core/services/user.service';
import {MatFormField} from '@angular/material/form-field';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from '@angular/forms';
import {
  CapacitorBarcodeScanner, CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection, CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner';
import {URLS} from '../../../../app.routes';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-share-identity',
  imports: [
    MatButton,
    QrCodeComponent,
    AsyncPipe,
    MatFormField,
    MatInputModule,
    MatIconModule,
    MatInput,
    ReactiveFormsModule,
  ],
  templateUrl: './share-identity.component.html',
  styleUrl: './share-identity.component.css',
})
export class ShareIdentityComponent {

  fingerprint: Promise<string | null>;

  constructor(keyService: KeyService, private userService: UserService, private router: Router, private snackbar: MatSnackBar) {
    this.fingerprint = keyService.getOwnFingerprint();
  }

  share() {
    this.userService.shareIdentity();
  }

  addByFp(value: string) {
    if (value == null || value.length != 16) {
      this.snackbar.open("Invalid fingerprint!");
    } else {
      this.router.navigateByUrl(URLS.ADD_CONNECTION_FN(value))
    }
  }

  async scanQr() {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.ALL,
      scanInstructions: 'Please scan a identity code',
      scanButton: true,
      scanText: 'Scan',
      cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
      android: {
        scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING,
      },
    });
    if (result.ScanResult != null) {
      this.router.navigateByUrl(URLS.ADD_CONNECTION_FN(result.ScanResult));
    }
  }
}
