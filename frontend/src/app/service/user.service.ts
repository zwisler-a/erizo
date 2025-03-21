import {Injectable} from '@angular/core';
import {KeyService} from './key.service';
import {BASE_PATH} from './constants';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserService {

  constructor(
    private keyService: KeyService,
    private http: HttpClient,
  ) {
  }


  async registerKey() {
    const public_key = await this.keyService.getOwnPublicKeyString();
    const fingerprint = await this.keyService.getOwnFingerprint();
    if (!public_key || !fingerprint) return;
    return firstValueFrom(this.http.post(`${BASE_PATH}/register-key`, {
      fingerprint: fingerprint,
      public_key: public_key
    }));
  }

}
