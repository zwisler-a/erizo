import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {KeyService} from '../../service/key.service';
import {Router} from '@angular/router';
import {UserService} from '../../service/user.service';

@Component({
  selector: 'app-landing-page',
  imports: [
    MatButton
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  constructor(private snackBar: MatSnackBar, private keyService: KeyService, private router: Router, private userService: UserService) {
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
            privateKey: await this.keyService.base64ToKey(identity.privateKey, "private"),
          })
          this.snackBar.open('Identity uploaded successfully', '', {duration: 2000});

        } else {
          this.snackBar.open('Identity upload failed', '', {duration: 2000});
        }
      } catch (error) {
        this.snackBar.open('Identity upload failed', '', {duration: 2000});
      }
    };
    reader.readAsText(file);
  }

  async generateIdentity() {
    await this.keyService.generateNewOwnKeyPair();
    await this.userService.registerKey();
    this.snackBar.open('Happy to have you here!', '', {duration: 4000});
    this.router.navigateByUrl('/');
  }
}
