import {Component, inject} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatLine} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {UserService} from '../../../../service/user.service';
import {MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {Router, RouterLink} from '@angular/router';
import {URLS} from '../../../../app.routes';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ERROR_SNACKBAR} from '../../../../util/snackbar-consts';

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
    private snackBar: MatSnackBar
  ) {
  }

  share() {
    this.userService.shareIdentity();
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
      this.snackBar.open("Could not paste from clipboard. Maybe the permission was not granted? Error:" + err.message, 'Ok', ERROR_SNACKBAR);
    });
  }

  protected readonly URLS = URLS;
}
