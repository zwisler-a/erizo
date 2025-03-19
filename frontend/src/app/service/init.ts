import {KeyService} from './key.service';
import {ContactService} from './contact.service';
import {inject} from '@angular/core';
import {ApiService} from './api.service';

export function initIdentity() {
  return async () => {
    const keyService: KeyService = inject(KeyService);
    const contactService: ContactService = inject(ContactService);
    const apiService = inject(ApiService);
    const currentKey = await contactService.getOwnKey();
    if (!currentKey) {
      console.log("Generating Identity ...");
      const keyPair = await keyService.generateKeyPair();
      await contactService.setOwnKey(keyPair);
    }
    await apiService.registerKey();
  };
}
