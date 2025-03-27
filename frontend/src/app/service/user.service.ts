import { Injectable } from '@angular/core';
import { KeyService } from './key.service';
import { ApiAuthenticationService } from '../api/services/api-authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
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
        url: url,
        title: `Hey, connect with me on erizo!`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Copied to clipboard!', '', { duration: 2000 });
      }).catch(console.error);
    }
  }

}
