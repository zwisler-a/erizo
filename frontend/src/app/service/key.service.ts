import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyService {
  async generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async generateHash(input: string): Promise<string> {
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
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      keyType === 'private' ? ['decrypt'] : ['encrypt']
    );
  }
}
