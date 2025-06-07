import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BiometricsService } from '../../../service/biometrics.service';
import { PinInputComponent } from '../../shared/pin-input/pin-input.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-set-app-auth-page',
  imports: [
    MatButton,
    PinInputComponent,
    NgIf,
  ],
  templateUrl: './set-app-auth-page.component.html',
  styleUrl: './set-app-auth-page.component.css',
})
export class SetAppAuthPageComponent {
  hasBiometrics;
  pinInput = false;


  constructor(private bioService: BiometricsService) {
    this.hasBiometrics = this.bioService.hasCredentials();
  }

  async enableBiometrics() {
    await this.bioService.register();
    this.hasBiometrics = this.bioService.hasCredentials();
  }

  async disableBiometrics() {
    await this.bioService.clear();
    this.hasBiometrics = this.bioService.hasCredentials();
  }

  setPin(pin: string) {
    localStorage.setItem('pin', pin);
    this.pinInput = false;
  }

  removePin() {
    localStorage.removeItem('pin');
  }

  hasPin() {
    return localStorage.getItem('pin') !== null;
  }
}
