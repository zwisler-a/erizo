import { Injectable } from '@angular/core';
import { KeyService } from './key.service';
import { MessageCreation } from '../types/message-creation';
import { UserEntity } from '../api/models/user-entity';
import { PostDto } from '../api/models/post-dto';
import { CommentEntity } from '../api/models/comment-entity';

export interface DecryptedPost {
  data: any,
  message: any
  comments: CommentEntity[]
}

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {

  private postCache = new Map<number, DecryptedPost>();

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

  async encryptText(message: string, forContacts: UserEntity[]) {
    const contacts: UserEntity[] = [...forContacts];
    const { recipients, aesKey, iv } = await this.generateSymmetricEncryptionKeys(contacts);
    const messageData = new TextEncoder().encode(message);
    const encryptedMessage = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
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

  async encryptImage(file: File, message: string, forContacts: UserEntity[]): Promise<MessageCreation> {
    const contacts: UserEntity[] = [...forContacts];
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

  evictCache(id:number) {
    this.postCache.delete(id);
  }

  async decryptPost(post: PostDto, privateKey?: CryptoKey): Promise<DecryptedPost> {
    if (this.postCache.has(post.id)) {
      const cache = this.postCache.get(post.id);
      if (cache) {
        return cache;
      }
    }
    if (!privateKey) {
      privateKey = await this.keyService.getOwnPrivateKey();
    }
    const encryptedKeyBuffer = this.base64ToArrayBuffer(post.decryptionKeys[0].encrypted_key);
    const encryptedDataBuffer = this.base64ToArrayBuffer(post.data);
    const encryptedMessageBuffer = this.base64ToArrayBuffer(post.message);
    const ivBuffer = this.base64ToArrayBuffer(post.iv);


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

    const fingerprint = (await this.keyService.getOwnFingerprint());

    const decrypted = {
      comments: await this.decryptPostComments(post.comments, privateKey, fingerprint!),
      data: decryptedData,
      message: new TextDecoder().decode(decryptedMessage),
    };
    this.postCache.set(post.id, decrypted);
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

  private decryptPostComments(comments: Array<CommentEntity>, privateKey: CryptoKey, ownFingerprint: string): Promise<CommentEntity[]> {
    const promises = comments.map(async (comment: CommentEntity) => {
      const decryptionKey = comment.decryptionKeys.find(key => key.recipient_fingerprint === ownFingerprint);
      const ivBuffer = this.base64ToArrayBuffer(comment.iv);
      const encryptedCommentBuffer = this.base64ToArrayBuffer(comment.content);
      if (!decryptionKey) throw new Error("No decryption key found.");
      const encryptedKeyBuffer = this.base64ToArrayBuffer(decryptionKey.encrypted_key);
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
      const decryptedComment = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: ivBuffer },
        importedAesKey,
        encryptedCommentBuffer,
      );
      console.log(decryptedComment);
      return {
        ...comment,
        content: new TextDecoder().decode(decryptedComment),
      };
    });
    return Promise.all(promises);
  }
}
