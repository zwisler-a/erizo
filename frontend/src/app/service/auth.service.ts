import { Injectable } from '@angular/core';
import { KeyService } from './key.service';
import { from, map, Observable, switchMap } from 'rxjs';
import { EncryptionService } from './encryption.service';
import { ApiAuthenticationService } from '../api/services/api-authentication.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {


  constructor(
    private keyService: KeyService,
    private encryptionService: EncryptionService,
    private authApi: ApiAuthenticationService,
  ) {
  }

  getAuthToken(): Observable<string> {
    const ownKey = from(this.keyService.getOwnPublicKeyString()).pipe(
      map(ownKey => {
        if (!ownKey) throw new Error(`${this.keyService.getOwnPublicKeyString()} is not a valid key`);
        return ownKey;
      }),
    );
    return ownKey.pipe(
      switchMap(ownKey => this.authApi.getChallenge({ body: { claimed_key: ownKey } })),
      switchMap(response => this.encryptionService.decryptTextMessage(response.challenge)),
      switchMap(challengeToken => this.authApi.verifyChallenge({ body: { challenge_token: challengeToken } })),
      map(response => response.access_token),
    );
  }

}
