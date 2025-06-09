import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatLine } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router, RouterLink } from '@angular/router';
import { URLS } from '../../../../app.routes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_SNACKBAR } from '../../../../util/snackbar-consts';
import {
  CapacitorBarcodeScanner, CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection, CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';
import {UserService} from '../../../../core/services/user.service';

@Component({
  selector: 'app-connection-options',
  imports: [
    MatListModule,
    MatIcon,
    MatLine,
    RouterLink,
  ],
  templateUrl: './connection-options.component.html',
  styleUrl: './connection-options.component.css',
})
export class ConnectionOptionsComponent {
  _bottomSheetRef =
    inject<MatBottomSheetRef<ConnectionOptionsComponent>>(MatBottomSheetRef);

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
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
    if(result.ScanResult != null) {
      this.router.navigateByUrl(URLS.ADD_CONNECTION_FN(result.ScanResult));
      this.close();
    }
  }

  close() {
    this._bottomSheetRef.dismiss();
  }

  paste() {
    navigator.clipboard.readText().then(text => {
      const urlParts = text.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (!lastPart || lastPart === '' || lastPart.length != 16) {
        this.router.navigateByUrl(URLS.HOME);
        return;
      }
      this.router.navigateByUrl(URLS.ADD_CONNECTION_FN(lastPart));
    }).catch(err => {
      this.snackBar.open('Could not paste from clipboard. Maybe the permission was not granted? Error:' + err.message, 'Ok', ERROR_SNACKBAR);
    });
  }

  protected readonly URLS = URLS;
}
