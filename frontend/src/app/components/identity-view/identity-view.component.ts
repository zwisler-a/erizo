import { Component } from '@angular/core';
import { KeyService } from '../../service/key.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { PersistenceService } from '../../service/persistence.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-identity-view',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatAccordion,
    MatIconModule,
  ],
  templateUrl: './identity-view.component.html',
  styleUrl: './identity-view.component.css',
})
export class IdentityViewComponent {

  ownFingerprint: string | null = '';

  constructor(
    private keyService: KeyService,
    private snackBar: MatSnackBar,
    private persistenceService: PersistenceService,
    private router: Router,
  ) {
    this.keyService.getOwnFingerprint().then(fp => {
      this.ownFingerprint = fp;
    });
  }

  async downloadIdentity() {
    const pair = await this.keyService.getOwnKeyPair();
    if (!pair) return;
    const identityData = JSON.stringify({
      publicKey: await this.keyService.keyToBase64(pair.publicKey),
      privateKey: await this.keyService.keyToBase64(pair.privateKey),
    });
    const blob = new Blob([identityData], { type: 'application/json' });
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
          await this.keyService.setOwnKeyPair({
            publicKey: await this.keyService.base64ToKey(identity.publicKey),
            privateKey: await this.keyService.base64ToKey(identity.privateKey, 'private'),
          });
          this.snackBar.open('Identity uploaded successfully', '', { duration: 2000 });

        } else {
          this.snackBar.open('Identity upload failed', '', { duration: 2000 });
        }
      } catch (error) {
        this.snackBar.open('Identity upload failed', '', { duration: 2000 });
      }
    };
    reader.readAsText(file);
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

  async deleteIdentity() {
    await this.persistenceService.clear();
    this.router.navigate(['/landing']);
  }

  switchTheme() {
    const isLight = localStorage.getItem('light') == 'true';
    const html = document.querySelector('html');
    if (html) {
      if (!isLight) {
        localStorage.setItem('light', 'true');
        html.style.colorScheme = 'light';
        console.log(html);
      } else {
        localStorage.setItem('light', 'false');
        html.style.colorScheme = 'dark';
        console.log(html);
      }
    }
  }
}
