import {Injectable} from '@angular/core';
import {KeyService} from './key.service';
import {CommentEntity} from '../../api/models/comment-entity';
import {UserEntity} from '../../api/models/user-entity';


export interface DecryptedPost {
  data: any,
  message: any
  comments: CommentEntity[]
}

interface EncryptedData {
  encryptedKey: string,
  encryptedData: string,
  iv: string,
}

interface MultipleRecipientEncryptedData {
  encryptedData: string[],
  iv: string,
  recipients: {
    fingerprint: string,
    encryption_key: string
  }[],

}

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {

  constructor(private keyService: KeyService) {
  }

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


  private async generateSymmetricEncryptionKeys(contacts: { public_key: string }[]) {
    const aesKey = await crypto.subtle.generateKey(
      {name: 'AES-CBC', length: 256},
      true,
      ['encrypt', 'decrypt'],
    );
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const recipients = await Promise.all(contacts.map(async (contact) => {
      const encryptedKey = await crypto.subtle.encrypt(
        {name: 'RSA-OAEP'},
        await this.keyService.base64ToKey(contact.public_key),
        exportedAesKey,
      );
      return {
        fingerprint: await this.keyService.generateFingerprint(contact.public_key),
        encryption_key: this.arrayBufferToBase64(encryptedKey),
      };
    }));
    return {recipients, iv, aesKey};
  }

  async encryptText(message: string, forContacts: UserEntity[]) {
    const contacts: UserEntity[] = [...forContacts];
    const {recipients, aesKey, iv} = await this.generateSymmetricEncryptionKeys(contacts);
    const messageData = new TextEncoder().encode(message);
    const encryptedMessage = await crypto.subtle.encrypt(
      {name: 'AES-CBC', iv},
      aesKey,
      messageData,
    );

    return {
      message: this.arrayBufferToBase64(encryptedMessage),
      sender_fingerprint: await this.keyService.getOwnFingerprint() ?? '',
      iv: this.arrayBufferToBase64(iv),
      recipients: recipients,
    };
  }

  async encrypt(data: ArrayBuffer | ArrayBuffer[], targets: {
    public_key: string
  }[]): Promise<MultipleRecipientEncryptedData> {
    const {recipients, aesKey, iv} = await this.generateSymmetricEncryptionKeys(targets);
    const buffers = Array.isArray(data) ? data : [data];

    const encryptedBuffers = await Promise.all(
      buffers.map(b =>
        crypto.subtle.encrypt({name: 'AES-CBC', iv}, aesKey, b)
      )
    );

    return {
      encryptedData: encryptedBuffers.map(b => this.arrayBufferToBase64(b)),
      recipients: recipients,
      iv: this.arrayBufferToBase64(iv)
    }
  }


  async decrypt<T extends 'arrayBuffer' | 'string' = 'arrayBuffer'>(
    data: EncryptedData,
    privateKey: CryptoKey,
    returnType?: T
  ): Promise<T extends 'string' ? string : ArrayBuffer> {
    const encryptedKeyBuffer = this.base64ToArrayBuffer(data.encryptedKey);
    const encryptedDataBuffer = this.base64ToArrayBuffer(data.encryptedData);
    const ivBuffer = this.base64ToArrayBuffer(data.iv);

    const aesKey = await crypto.subtle.decrypt(
      {name: 'RSA-OAEP'},
      privateKey,
      encryptedKeyBuffer,
    );

    const importedAesKey = await crypto.subtle.importKey(
      'raw',
      aesKey,
      {name: 'AES-CBC'},
      false,
      ['decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      {name: 'AES-CBC', iv: ivBuffer},
      importedAesKey,
      encryptedDataBuffer,
    );

    if (returnType === 'string') {
      return new TextDecoder().decode(decrypted) as any;
    }

    return decrypted as any;
  }

  async decryptTextMessage(message: string, privateKey?: CryptoKey): Promise<string> {
    if (!privateKey) {
      privateKey = await this.keyService.getOwnPrivateKey();
    }
    const decryptedBuffer = await crypto.subtle.decrypt(
      {name: 'RSA-OAEP'},
      privateKey,
      this.base64ToArrayBuffer(message),
    );
    return new TextDecoder().decode(decryptedBuffer);
  }

}
