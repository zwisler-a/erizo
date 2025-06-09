import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { URLS } from '../app.routes';
import {KeyService} from './crypto/key.service';
import {UserService} from './services/user.service';

export function initIdentity() {
  return async () => {
    const keyService: KeyService = inject(KeyService);
    const userService = inject(UserService);
    const router = inject(Router);

    const html = document.querySelector('html');
    if (html) {
      if (localStorage.getItem('light') == 'true') {
        html.style.colorScheme = 'light';
      } else {
        html.style.colorScheme = 'dark';
      }
    }


    const currentKey = await keyService.getOwnKeyPair();
    if (!currentKey) {
      router.navigate([URLS.LANDING]);
    } else {
      await userService.registerKey();
    }
  };
}
