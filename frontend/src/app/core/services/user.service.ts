import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {KeyService} from '../crypto/key.service';
import {ApiAuthenticationService} from '../../api/services/api-authentication.service';
import {ERROR_SNACKBAR} from '../../util/snackbar-consts';

@Injectable({providedIn: 'root'})
export class UserService {

  constructor(
    private keyService: KeyService,
    private authService: ApiAuthenticationService,
    private snackBar: MatSnackBar,
  ) {
  }


  async registerKey() {
    const public_key = await this.keyService.getOwnPublicKeyString();
    const fingerprint = await this.keyService.getOwnFingerprint();
    if (!public_key || !fingerprint) return;
    this.authService.register({
      body: {
        fingerprint,
        public_key,
      },
    }).subscribe();
  }

  async shareIdentity() {
    const url = `${window.location.origin}/add-contact/${await this.keyService.getOwnFingerprint()}`;
    if (navigator.share) {
      navigator.share({
        // url: url,
        title: `Hey, connect with me on erizo!`,
        text: "Use the fingerprint " + await this.keyService.getOwnFingerprint()
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Copied to clipboard!', '', {duration: 2000});
      }).catch((e) => {
        this.snackBar.open('Could not copy to clipboard! Maybe the permission was not granted? Error:' + e.message, '', ERROR_SNACKBAR);
      });
    }
  }

}
