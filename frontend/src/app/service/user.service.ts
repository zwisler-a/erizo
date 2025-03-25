import { Injectable } from '@angular/core';
import { KeyService } from './key.service';
import { BASE_PATH } from './constants';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiAuthenticationService } from '../api/services/api-authentication.service';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(
    private keyService: KeyService,
    private authService: ApiAuthenticationService,
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

}
