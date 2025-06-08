import {Injectable} from '@angular/core';
import {KeyService} from './key.service';
import {ApiAuthenticationService} from '../api/services/api-authentication.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ERROR_SNACKBAR} from '../util/snackbar-consts';
import { Share } from '@capacitor/share';

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
    return await Share.share({
      title: 'Connect on Erizo ;)',
      text: 'Do you want to connect with me on Erizo?',
      url: `${window.location.origin}/add-contact/${await this.keyService.getOwnFingerprint()}`,
      dialogTitle: 'Connect with',
    });




    const url = `${window.location.origin}/add-contact/${await this.keyService.getOwnFingerprint()}`;
    if (navigator.share) {
      navigator.share({
        url: url,
        title: `Hey, connect with me on erizo!`,

      }).catch(e => {throw new Error(JSON.stringify(e))});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Copied to clipboard!', '', {duration: 2000});
      }).catch((e) => {
        this.snackBar.open('Could not copy to clipboard! Maybe the permission was not granted? Error:' + e.message, '', ERROR_SNACKBAR);
      });
    }
  }

}
