import {Injectable} from '@angular/core';
import {NativeBiometric} from '@capgo/capacitor-native-biometric';

@Injectable({providedIn: 'root'})
export class BiometricsService {

  async register(): Promise<void> {
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) return;
    await NativeBiometric.setCredentials({
      username: "doesnt",
      password: "matter",
      server: "erizo.zwisler.dev",
    });
    localStorage.setItem("bio-auth", "true");
  }

  async login(): Promise<boolean> {
    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) return false;

    const verified = await NativeBiometric.verifyIdentity({
    })
      .then(() => true)
      .catch(() => false);

    return verified;
  }

  hasCredentials() {
    return localStorage.getItem('bio-auth') == 'true';
  }

  async clear() {
    await NativeBiometric.deleteCredentials({
      server: "erizo.zwisler.dev",
    }).then();
    localStorage.setItem("bio-auth", "false");
  }
}
