import {KeyService} from './key.service';
import {inject} from '@angular/core';
import {UserService} from './user.service';
import {Router} from '@angular/router';

export function initIdentity() {
  return async () => {
    const keyService: KeyService = inject(KeyService);
    const userService = inject(UserService);
    const router = inject(Router);

    const html = document.querySelector("html");
    if(html) {
      if ( localStorage.getItem("light") == "true") {
        html.style.colorScheme = "light";
      } else {
        html.style.colorScheme = "dark";
      }
    }


    const currentKey = await keyService.getOwnKeyPair();
    if (!currentKey) {
      router.navigate(['/landing']);
    } else {
      await userService.registerKey();
    }
  };
}
