import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class BiometricsService {

  async register(): Promise<void> {
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: new TextEncoder().encode('register-challenge'),
      rp: { name: 'Erizo' },
      user: {
        id: new TextEncoder().encode('user-id'),
        name: 'erizo',
        displayName: 'Erizo user',
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      authenticatorSelection: { userVerification: 'preferred' },
      timeout: 60000,
      attestation: 'none',
    };

    const cred = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    const rawId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));

    localStorage.setItem('credential', JSON.stringify({
      id: cred.id,
      rawId,
      type: cred.type,
    }));

    alert('Registered');
  }

  async login(): Promise<boolean> {
    const stored = localStorage.getItem('credential');
    if (!stored) {
      return false;
    }

    const cred = JSON.parse(stored);
    const rawIdBytes = Uint8Array.from(atob(cred.rawId), c => c.charCodeAt(0));

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: new TextEncoder().encode('login-challenge'),
      allowCredentials: [{
        id: rawIdBytes,
        type: 'public-key',
      }],
      timeout: 60000,
      userVerification: 'preferred',
    };

    const assertion = await navigator.credentials.get({ publicKey });
    return assertion !== null;
  }

  hasCredentials() {
    return !!localStorage.getItem('credential');
  }

  clear() {
    localStorage.removeItem('credential');
  }
}
