import { Injectable } from '@angular/core';
import { DecryptedMessage, EncryptionService } from './encryption.service';
import { BehaviorSubject, map, mergeMap, Observable, OperatorFunction, shareReplay } from 'rxjs';
import { ContactService } from './contact.service';
import { DomSanitizer } from '@angular/platform-browser';
import imageCompression from 'browser-image-compression';
import { ApiMessageService } from '../api/services/api-message.service';
import { MessageDto } from '../api/models/message-dto';
import { UserEntity } from '../api/models/user-entity';
import { NotificationService } from './notification.service';

export type CompleteMessage = MessageDto & DecryptedMessage & { alias: string } & { url: any };

@Injectable({
  providedIn: 'root',
})
export class MessageService {

  private reloadMessages = new BehaviorSubject<void>(void 0);
  private encryptedMessages = this.reloadMessages.pipe(
    mergeMap(() => this.messageApi.getMessages({})),
    map(messages => messages.sort((a, b) => b.created_at - a.created_at)),
    shareReplay(1),
  );

  constructor(
    private encryptionService: EncryptionService,
    private contactService: ContactService,
    private sanitizer: DomSanitizer,
    private messageApi: ApiMessageService,
    private notificationService: NotificationService,
  ) {

    // Hack to reload messages when new ones arrive
    this.notificationService.getNotifications().subscribe(_ => {
      this.reloadMessages.next();
    });
  }


  getAllMessages(): Observable<CompleteMessage[]> {
    return this.encryptedMessages.pipe(
      this.messageDecryptionPipe(),
    );
  }

  getAllMessagesFor(chatId: number): Observable<CompleteMessage[]> {
    return this.reloadMessages.pipe(
      mergeMap(() => this.messageApi.getChatMessages({ chatId: chatId })),
      map(messages => messages.sort((a, b) => b.created_at - a.created_at)),
      this.messageDecryptionPipe(),
    );
  }

  async sendMessage(file: File, chatId: number, contacts: UserEntity[], textMessage?: string, daysToLive?: number) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const message = await this.encryptionService.encryptImage(compressedFile, textMessage ?? '', contacts);
    this.messageApi.send({ body: { ...message, days_to_live: daysToLive, chat_id: chatId } }).subscribe(() => {
      this.reloadMessages.next();
    });
  }

  private messageDecryptionPipe(): OperatorFunction<MessageDto[], CompleteMessage[]> {
    return (source) => {
      return source.pipe(
        mergeMap(async messages =>
          Promise.all(messages.map(async message => ({ ...message, ...(await this.encryptionService.decryptMessage(message)) }))),
        ),
        mergeMap(async messages => {
          const mapped = messages.map(async message => ({
              ...message,
              alias: await this.contactService.getAlias(message.sender_fingerprint) ?? message.sender_fingerprint,
            }),
          );
          return Promise.all(mapped);
        }),
        this.createUrlPipe(),
      );
    };
  }

  private createUrlPipe(): OperatorFunction<any[], CompleteMessage[]> {
    return source => {
      return source.pipe(
        map(messages => {
          return messages.map(msg => {
            const uint8Array = new Uint8Array(msg.data);
            const binary = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
            const base64String = window.btoa(binary);
            const url = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${base64String}`);
            return ({ ...msg, url } as any);
          });
        }),
      );
    };
  }


}
