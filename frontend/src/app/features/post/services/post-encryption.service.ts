import {Injectable} from '@angular/core';
import {PostDto} from '../../../api/models/post-dto';
import {EncryptionService} from '../../../core/crypto/encryption.service';
import {KeyService} from '../../../core/crypto/key.service';
import {CommentEntity} from '../../../api/models/comment-entity';
import {DomSanitizer} from '@angular/platform-browser';
import {DecryptedPost} from '../types/decrypted-post.interface';
import {UserEntity} from '../../../api/models/user-entity';
import {MessageCreation} from '../../../types/message-creation';


@Injectable({providedIn: 'root'})
export class PostEncryptionService {

  private postCache = new Map<number, DecryptedPost>();

  constructor(private encryptionService: EncryptionService, private keyService: KeyService,
              private sanitizer: DomSanitizer) {
  }

  evictCache(id?: number) {
    if (id) {
      this.postCache.delete(id);
    } else {
      this.postCache.clear();
    }
  }

  async decryptPost(post: PostDto): Promise<DecryptedPost> {
    if (this.postCache.has(post.id)) {
      const cache = this.postCache.get(post.id);
      if (cache) {
        return cache;
      }
    }
    const privateKey = await this.keyService.getOwnPrivateKey();
    const fingerprint = await this.keyService.getOwnFingerprint();
    if (!privateKey || !fingerprint) throw new Error('Not able to find own identity');

    const imageData = await this.encryptionService.decrypt({
      encryptedData: post.data,
      iv: post.iv,
      encryptedKey: post.decryptionKeys[0].encrypted_key
    }, privateKey);

    const message = await this.encryptionService.decrypt({
      encryptedData: post.message,
      iv: post.iv,
      encryptedKey: post.decryptionKeys[0].encrypted_key
    }, privateKey, "string");

    const uint8Array = new Uint8Array(imageData);
    const binary = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
    const base64String = window.btoa(binary);
    const imageAsUrl = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${base64String}`);

    const decryptedPost = {
      ...post,
      decryptedData: imageData,
      decryptedMessage: message,
      imageUrl: imageAsUrl,
      decryptedComments: await this.decryptComment(post, privateKey, fingerprint)
    };
    this.postCache.set(post.id, decryptedPost);
    return decryptedPost;
  }

  private async decryptComment(post: PostDto, privateKey: CryptoKey, fingerprint: string): Promise<CommentEntity[]> {
    const comments = await Promise.all(post.comments.map(async comment => {
      const decryptionKey = comment.decryptionKeys.find(key => key.recipient_fingerprint === fingerprint);
      if (decryptionKey) {
        const commentContent = await this.encryptionService.decrypt({
          encryptedData: comment.content,
          iv: comment.iv,
          encryptedKey: decryptionKey.encrypted_key
        }, privateKey, 'string');
        return {...comment, content: commentContent};
      } else {
        return {...comment, content: 'decryption failure'}
      }
    }));
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return comments;
  }

  async encryptPost(file: File, message: string, forContacts: UserEntity[]): Promise<MessageCreation> {
    const encryptedData = await this.encryptionService.encrypt([
        await file.arrayBuffer(),
        new TextEncoder().encode(message)],
      forContacts);

    const ownFingerprint = await this.keyService.getOwnFingerprint();
    if (!ownFingerprint) throw new Error('Not able to find own identity');

    return {
      data: encryptedData.encryptedData[0],
      message: encryptedData.encryptedData[1],
      iv: encryptedData.iv,
      sender_fingerprint: ownFingerprint,
      recipients: encryptedData.recipients.map(rec => ({
        encryption_key: rec.encryption_key,
        fingerprint: rec.fingerprint
      }))
    }

  }

}
