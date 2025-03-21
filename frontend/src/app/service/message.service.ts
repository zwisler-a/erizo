import {Injectable} from '@angular/core';
import {DecryptedMessage, EncryptionService} from './encryption.service';
import {BehaviorSubject, map, mergeMap, Observable, OperatorFunction, shareReplay, switchMap} from 'rxjs';
import {BASE_PATH} from './constants';
import {HttpClient} from '@angular/common/http';
import {ChallengeService} from './challenge.service';
import {Contact, ContactService} from './contact.service';
import {Message} from '../types/message';
import {DomSanitizer} from '@angular/platform-browser';
import imageCompression from 'browser-image-compression';

export type CompleteMessage = Message & DecryptedMessage & { alias: string } & { url: any };

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private reloadMessages = new BehaviorSubject<void>(void 0);
  private encryptedMessages = this.reloadMessages.pipe(
    mergeMap(() => this.challengeService.getChallengeToken()),
    mergeMap(token => this.http.post<Message[]>(`${BASE_PATH}/messages`, token)),
    map(messages => messages.sort((a, b) => b.created_at - a.created_at)),
    shareReplay(1)
  );

  constructor(
    private encryptionService: EncryptionService,
    private challengeService: ChallengeService,
    private contactService: ContactService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
  }


  getAllMessages(): Observable<CompleteMessage[]> {
    return this.encryptedMessages.pipe(
      this.messageDecryptionPipe()
    );
  }

  getAllMessagesFor(fingerprint: string[]): Observable<CompleteMessage[]> {
    return this.encryptedMessages.pipe(
      map(messages => messages
        .filter(message => fingerprint.includes(message.sender_fingerprint))
      ),
      this.messageDecryptionPipe()
    );
  }

  async sendMessage(file: File, contact: Contact, textMessage?: string, daysToLive?: number) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    const compressedFile = await imageCompression(file, options);
    const message = await this.encryptionService.encryptImage(compressedFile, textMessage ?? '', [contact]);
    this.challengeService.getChallengeToken().pipe(
      switchMap(token => this.http.post(`${BASE_PATH}/upload`, {...token, ...message, days_to_live: daysToLive}))
    ).subscribe(() => {
      this.reloadMessages.next();
    })
  }

  private messageDecryptionPipe(): OperatorFunction<Message[], CompleteMessage[]> {
    return (source) => {
      return source.pipe(
        mergeMap(async messages =>
          Promise.all(messages.map(async message => ({...message, ...(await this.encryptionService.decryptMessage(message))})))
        ),
        mergeMap(async messages => {
          const mapped = messages.map(async message => ({
              ...message,
              alias: (await this.contactService.getContact(message.sender_fingerprint))?.alias ?? 'You'
            })
          );
          return Promise.all(mapped);
        }),
        this.createUrlPipe()
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
            return ({...msg, url} as any);
          });
        })
      )
    }
  }


}
