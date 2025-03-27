import { Component } from '@angular/core';
import { KeyService } from '../../../service/key.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { PersistenceService } from '../../../service/persistence.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../service/notification.service';
import { ConfirmationService } from '../../../service/confirmation.service';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-user-page',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,

  ],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css',
})
export class UserPageComponent {

  ownFingerprint: string | null = '';

  constructor(
    private keyService: KeyService,
    private snackBar: MatSnackBar,
    private persistenceService: PersistenceService,
    private router: Router,
    private notificationService: NotificationService,
    private confirmation: ConfirmationService,
    private userService: UserService,
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


  async shareIdentity() {
    this.userService.shareIdentity();
  }

  async deleteIdentity() {
    this.confirmation.confirm('Are your sure? You will lose everything, if you did not download your identity!')
      .subscribe(async (confirmed) => {
        if (!confirmed) return;
        await this.persistenceService.clear();
        this.router.navigate(['/landing']);
      });

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

  async enableNotifications() {
    try {
      const success = await this.notificationService.enableNotifications();
      if (success) {
        this.snackBar.open('Notifications are enabled ', '', { duration: 2000 });
      } else {
        this.snackBar.open('Could not enable notifications', '', { duration: 2000 });
      }
    } catch (e) {
      console.log(e);
      this.snackBar.open('Could not enable notifications', '', { duration: 2000 });
    }

  }
}
