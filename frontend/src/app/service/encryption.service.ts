import { Injectable } from '@angular/core';
import { KeyService } from './key.service';
import { MessageCreation } from '../types/message-creation';
import { MessageDto } from '../api/models/message-dto';
import { UserEntity } from '../api/models/user-entity';

export interface DecryptedMessage {
  data: any,
  message: any
}

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {

  private messageCache = new Map<number, DecryptedMessage>();

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


  private async generateSymmetricEncryptionKeys(contacts: UserEntity[]) {
    const aesKey = await crypto.subtle.generateKey(
      { name: 'AES-CBC', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const recipients = await Promise.all(contacts.map(async (contact: UserEntity) => {
      const encryptedKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        await this.keyService.base64ToKey(contact.public_key),
        exportedAesKey,
      );
      return {
        fingerprint: await this.keyService.generateFingerprint(contact.public_key),
        encryption_key: this.arrayBufferToBase64(encryptedKey),
      };
    }));
    return { recipients, iv, aesKey };
  }

  async encryptImage(file: File, message: string, forContacts: UserEntity[], addOwnContact = true): Promise<MessageCreation> {
    const contacts: UserEntity[] = [...forContacts];
    if (addOwnContact) {
      contacts.push({
        fingerprint: await this.keyService.getOwnFingerprint() ?? '',
        public_key: await this.keyService.getOwnPublicKeyString() ?? ''
      });
    }
    const { recipients, aesKey, iv } = await this.generateSymmetricEncryptionKeys(contacts);
    const fileData = await file.arrayBuffer();
    const messageData = new TextEncoder().encode(message);
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      aesKey,
      fileData,
    );
    const encryptedMessage = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      aesKey,
      messageData,
    );

    return {
      data: this.arrayBufferToBase64(encryptedData),
      message: this.arrayBufferToBase64(encryptedMessage),
      sender_fingerprint: await this.keyService.getOwnFingerprint() ?? '',
      iv: this.arrayBufferToBase64(iv),
      recipients: recipients,
    };
  }

  async decryptMessage(message: MessageDto, privateKey?: CryptoKey): Promise<DecryptedMessage> {
    if (this.messageCache.has(message.id)) {
      const cache = this.messageCache.get(message.id);
      if (cache) {
        return cache;
      }
    }
    if (!privateKey) {
      privateKey = await this.keyService.getOwnPrivateKey();
    }
    const encryptedKeyBuffer = this.base64ToArrayBuffer(message.decryptionKeys[0].encrypted_key);
    const encryptedDataBuffer = this.base64ToArrayBuffer(message.data);
    const encryptedMessageBuffer = this.base64ToArrayBuffer(message.message);
    const ivBuffer = this.base64ToArrayBuffer(message.iv);


    const aesKey = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedKeyBuffer,
    );

    const importedAesKey = await crypto.subtle.importKey(
      'raw',
      aesKey,
      { name: 'AES-CBC' },
      false,
      ['decrypt'],
    );

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBuffer },
      importedAesKey,
      encryptedDataBuffer,
    );
    const decryptedMessage = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBuffer },
      importedAesKey,
      encryptedMessageBuffer,
    );
    const decrypted = { data: decryptedData, message: new TextDecoder().decode(decryptedMessage) };
    this.messageCache.set(message.id, decrypted);
    return decrypted;
  }

  async decryptTextMessage(message: string, privateKey?: CryptoKey): Promise<string> {
    if (!privateKey) {
      privateKey = await this.keyService.getOwnPrivateKey();
    }
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      this.base64ToArrayBuffer(message),
    );
    return new TextDecoder().decode(decryptedBuffer);
  }
}
