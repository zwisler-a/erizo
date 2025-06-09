import { Component, NgZone } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { App } from '@capacitor/app';
import { ERROR_SNACKBAR } from '../../../util/snackbar-consts';
import { Router } from '@angular/router';
import { URLS } from '../../../app.routes';
import {PinInputComponent} from '../../../shared/components/pin-input/pin-input.component';
import {BiometricsService} from '../../../features/user/services/biometrics.service';

@Component({
  selector: 'app-lockscreen',
  imports: [
    MatButton,
    NgIf,
    PinInputComponent,
  ],
  templateUrl: './lockscreen.component.html',
  styleUrl: './lockscreen.component.css',
})
export class LockscreenComponent {
  locked = false;
  hasBiometrics = false;
  hasPin = false;

  constructor(
    private bioService: BiometricsService,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private router: Router,
  ) {
    this.lock();
    App.addListener('resume', () => {
      this.onWindowBlur();
    });

    if (
      !this.bioService.hasCredentials() &&
      localStorage.getItem('pin') == null
    ) {
      this.locked = false;
      this.snackBar.open('Want to make the app a bit more secure?', 'Ok', {
        duration: 10000,
        verticalPosition: 'bottom',
      })
        .onAction()
        .subscribe(() => this.router.navigateByUrl('/' + URLS.SET_APP_AUTH));
    }
  }


  onWindowBlur() {
    if (
      this.bioService.hasCredentials() ||
      localStorage.getItem('pin') !== null
    ) {
      this.lock();
    } else {
      this.unlock();
    }
  }


  private lock() {
    this.zone.run(() => {
      this.locked = true;
      this.hasBiometrics = this.bioService.hasCredentials();
      this.hasPin = localStorage.getItem('pin') !== null;
    });
  }

  private unlock() {
    this.zone.run(() => {
      this.locked = false;
    });
  }

  async authenticate() {
    const auth = await this.bioService.login();
    if (auth) {
      setTimeout(() => this.locked = false, 100);
    } else {
      this.snackBar.open('Could not authenticate', 'Ok', ERROR_SNACKBAR);
    }
  }

  checkPin(pin: string) {
    if (localStorage.getItem('pin') == pin) {
      this.locked = false;
    }
  }
}
