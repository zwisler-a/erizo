import {Injectable} from '@angular/core';
import {PersistenceService} from './persistence.service';

@Injectable({
  providedIn: 'root'
})
export class KeyService {

  constructor(private persistenceService: PersistenceService) {
  }

  async getOwnKeyPair(): Promise<CryptoKeyPair | null> {
    return this.persistenceService.getItem("OWN_KEY");
  }

  async setOwnKeyPair(key: CryptoKeyPair) {
    await this.persistenceService.setItem("OWN_KEY", key);
  }

  async getOwnPrivateKey() {
    const privateKey = await this.getOwnKeyPair().then(keyPair => keyPair?.privateKey);
    if (!privateKey) {
      throw new Error("No public key found.");
    }
    return privateKey;
  }

  async getOwnPublicKeyString(): Promise<string | null> {
    const publicKey = await this.getOwnKeyPair().then(keyPair => keyPair?.publicKey);
    if (!publicKey) {
      throw new Error("No public key found.");
    }
    return this.keyToBase64(publicKey);
  }

  async getOwnFingerprint(): Promise<string | null> {
    const keypair = await this.getOwnKeyPair();
    if (!keypair) {
      throw new Error("No key pair found.");
    }
    return this.generateFingerprintFromKeyPair(keypair);
  }

  async generateNewOwnKeyPair() {
    console.log("Generating new key pair");
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    await this.setOwnKeyPair(keyPair);
    return this.getOwnKeyPair();
  }

  async generateFingerprintFromKeyPair(keyPair: CryptoKeyPair) {
    const base = await this.keyToBase64(keyPair.publicKey);
    return this.generateFingerprint(base)
  }

  async generateFingerprint(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((byte) => ('00' + byte.toString(16)).slice(-2))
      .join('')
      .substring(0, 16);
  }

  async keyToBase64(key: CryptoKey): Promise<string> {
    const exportedKey = await crypto.subtle.exportKey(key.type === 'private' ? 'pkcs8' : 'spki', key);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  }

  async base64ToKey(base64Key: string, keyType: 'public' | 'private' = "public"): Promise<CryptoKey> {
    const binaryKey = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey(
      keyType === 'private' ? 'pkcs8' : 'spki',
      binaryKey.buffer,
      {name: 'RSA-OAEP', hash: 'SHA-256'},
      true,
      keyType === 'private' ? ['decrypt'] : ['encrypt']
    );
  }


}
