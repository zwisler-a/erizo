import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { QrCodeComponent } from 'ng-qrcode';
import { AsyncPipe } from '@angular/common';
import {KeyService} from '../../../../core/crypto/key.service';
import {UserService} from '../../../../core/services/user.service';

@Component({
  selector: 'app-share-identity',
  imports: [
    MatButton,
    QrCodeComponent,
    AsyncPipe,
  ],
  templateUrl: './share-identity.component.html',
  styleUrl: './share-identity.component.css',
})
export class ShareIdentityComponent {

  fingerprint: Promise<string | null>;

  constructor(keyService: KeyService, private userService: UserService) {
    this.fingerprint = keyService.getOwnFingerprint();
  }

  share() {
    this.userService.shareIdentity();
  }
}
