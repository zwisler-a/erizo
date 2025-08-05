import {MatButtonModule} from '@angular/material/button';
import {Component} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import {KeyService} from '../../../../core/crypto/key.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PersistenceService} from '../../../../core/services/persistence.service';
import {NotificationService} from '../../../notification/services/notification.service';
import {ConfirmationService} from '../../../../shared/services/confirmation.service';
import {UserService} from '../../../../core/services/user.service';
import {PostService} from '../../../post/services/post.service';
import {ERROR_SNACKBAR} from '../../../../util/snackbar-consts';
import {URLS} from '../../../../app.routes';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ApiConfiguration} from '../../../../api/api-configuration';


@Component({
  selector: 'app-user-page',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    RouterLink,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,

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
    private postService: PostService,
    private apiConfig: ApiConfiguration
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
        this.snackBar.open('Notifications are enabled ', '', {duration: 2000});
      } else {
        this.snackBar.open('Could not enable notifications', '', ERROR_SNACKBAR);
      }
    } catch (e) {
      console.log(e);
      this.snackBar.open('Could not enable notifications', '', ERROR_SNACKBAR);
    }
  }

  async clearImageCache() {
    await this.postService.clearImageCache();
    this.snackBar.open('Post cache cleared!', '', {duration: 2000});
  }

  setBackendUrl() {
    this.confirmation.confirmWithInput(`Url: (${this.apiConfig.rootUrl})`, this.apiConfig.rootUrl).subscribe(async (input) => {
      this.apiConfig.rootUrl = input
      localStorage.setItem('url', input);
      if (!input || input === '') {
        localStorage.removeItem('url');
      }
      window.location.reload();
    })
  }


  protected readonly URLS = URLS;
}
