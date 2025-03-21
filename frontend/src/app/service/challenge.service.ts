import {Injectable} from '@angular/core';
import {KeyService} from './key.service';
import {HttpClient} from '@angular/common/http';
import {BASE_PATH} from './constants';
import {from, map, switchMap} from 'rxjs';
import {EncryptionService} from './encryption.service';


@Injectable({
  providedIn: 'root'
})
export class ChallengeService {


  constructor(
    private keyService: KeyService,
    private encryptionService: EncryptionService,
    private http: HttpClient
  ) {
  }

  public getChallengeToken() {
    return from(this.keyService.getOwnPublicKeyString()).pipe(
      switchMap(key => this.http.post<{ challenge: string }>(`${BASE_PATH}/challenge`, {claimed_key: key})),
      switchMap(challenge => this.encryptionService.decryptTextMessage(challenge.challenge)),
      map(data => ({challenge_token: data}))
    );
  }

}
