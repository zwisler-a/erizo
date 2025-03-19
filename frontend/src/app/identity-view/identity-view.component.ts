import {Component} from '@angular/core';
import {NgxKjuaComponent} from 'ngx-kjua';
import {ContactService} from '../service/contact.service';
import {KeyService} from '../service/key.service';
import {NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ApiService} from '../service/api.service';

@Component({
  selector: 'app-identity-view',
  imports: [
    NgxKjuaComponent,
    NgIf,
    MatButtonModule
  ],
  templateUrl: './identity-view.component.html',
  styleUrl: './identity-view.component.css'
})
export class IdentityViewComponent {

  ownPublicKey: string = '';
  ownHash: string = '';

  constructor(
    private contactService: ContactService,
    private keyService: KeyService,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
  ) {
    this.loadKey();
  }

  async loadKey() {
    const keyPair = await this.contactService.getOwnKey();
    if (keyPair) {
      const keyAsBase64 = await this.keyService.keyToBase64(keyPair?.publicKey)
      this.ownPublicKey = keyAsBase64;
      this.ownHash = await this.keyService.generateHash(this.ownPublicKey);
    } else {
      console.log('No key found')
    }
  }

  async generateIdentity() {
    const keyPair = await this.keyService.generateKeyPair();
    await this.contactService.setOwnKey(keyPair);
    await this.apiService.registerKey();
    await this.loadKey();
  }

  async downloadIdentity() {
    const pair = await this.contactService.getOwnKey();
    if (!pair) return;
    const identityData = JSON.stringify({
      publicKey: await this.keyService.keyToBase64(pair.publicKey),
      privateKey: await this.keyService.keyToBase64(pair.privateKey),
    });
    const blob = new Blob([identityData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'identity.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async uploadIdentity(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const identity = JSON.parse(result);
        if (identity.publicKey && identity.privateKey) {
          await this.contactService.setOwnKey({
            publicKey: await this.keyService.base64ToKey(identity.publicKey),
            privateKey: await this.keyService.base64ToKey(identity.privateKey, "private"),
          })
          this.snackBar.open('Identity uploaded successfully', '', {duration: 2000});
          this.loadKey();
        } else {
          this.snackBar.open('Identity upload failed', '', {duration: 2000});
        }
      } catch (error) {
        this.snackBar.open('Identity upload failed', '', {duration: 2000});
      }
    };
    reader.readAsText(file);
  }

  shareIdentity() {
    const url = `${window.location.origin}/add-contact/${this.ownHash}`;
    if (navigator.share) {
      navigator.share({
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open("Copied to clipboard!", "", {duration: 2000});
      }).catch(console.error);
    }
  }
}
