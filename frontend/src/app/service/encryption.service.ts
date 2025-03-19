import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async encryptFile(file: File, publicKey: CryptoKey, ownKey: CryptoKey): Promise<{
    encryptedData: string;
    ownEncryptedKey: string;
    encryptedKey: string;
    iv: string;
  }> {
    const aesKey = await crypto.subtle.generateKey(
      {name: 'AES-CBC', length: 256},
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const fileData = await file.arrayBuffer();

    const encryptedData = await crypto.subtle.encrypt(
      {name: 'AES-CBC', iv},
      aesKey,
      fileData
    );

    const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedKey = await crypto.subtle.encrypt(
      {name: 'RSA-OAEP'},
      publicKey,
      exportedAesKey
    );
    const ownEncryptedKey = await crypto.subtle.encrypt(
      {name: 'RSA-OAEP'},
      ownKey,
      exportedAesKey
    );

    return {
      encryptedData: this.arrayBufferToBase64(encryptedData),
      encryptedKey: this.arrayBufferToBase64(encryptedKey),
      ownEncryptedKey: this.arrayBufferToBase64(ownEncryptedKey),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  async decryptMessage(encryptedData: string, encryptedKey: string, iv: string, privateKey: CryptoKey): Promise<ArrayBuffer> {
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKey);
    const encryptedDataBuffer = this.base64ToArrayBuffer(encryptedData);
    const ivBuffer = this.base64ToArrayBuffer(iv);


    const aesKey = await crypto.subtle.decrypt(
      {name: 'RSA-OAEP'},
      privateKey,
      encryptedKeyBuffer
    );

    const importedAesKey = await crypto.subtle.importKey(
      'raw',
      aesKey,
      {name: 'AES-CBC'},
      false,
      ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(
      {name: 'AES-CBC', iv: ivBuffer},
      importedAesKey,
      encryptedDataBuffer
    );

    return decryptedData;

  }

  async decryptTextMessage(privateKey: CryptoKey, message: string): Promise<string> {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {name: 'RSA-OAEP'},
      privateKey,
      this.base64ToArrayBuffer(message)
    );
    return new TextDecoder().decode(decryptedBuffer);
  }
}
