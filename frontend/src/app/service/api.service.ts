import {Injectable} from '@angular/core';
import {EncryptionService} from './encryption.service';
import {KeyService} from './key.service';
import {ContactService} from './contact.service';
import {Observable} from 'rxjs';

type Message = {
  encrypted_data: string;
  recipient_key: string;
  recipient_public_key: string;
  sender_public_key: string;
  sender_key: string;
  iv: string;
  created_at: string;
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = "/api";

  constructor(
    private encryptionService: EncryptionService,
    private keyService: KeyService,
    private contactService: ContactService,
  ) {
  }

  fetchMessages(): Observable<{ created_at: Date, image: ArrayBuffer }> {

    return new Observable(observer => {
      (async () => {
        let keyPair = await this.contactService.getOwnKey();
        if (!keyPair) return;

        const {challenge} = await fetch(this.baseUrl + '/challenge', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            claimed_key: await this.keyService.keyToBase64(keyPair?.publicKey),
          })
        }).then(res => res.json());
        const challenge_token = await this.encryptionService.decryptTextMessage(keyPair?.privateKey, challenge);
        const response = await fetch(this.baseUrl + '/messages', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            challenge_token
          })
        });

        const encryptedMessages: { received: Message[], send: Message[] } = await response.json();

        const mapMessageTaskFactory =
          (acc: (msg: Message) => string) =>
            (message: Message) =>
              async () => ({
                created_at: new Date(message.created_at),
                image: await this.encryptionService.decryptMessage(message.encrypted_data, acc(message), message.iv, keyPair?.privateKey),
              })

        const recMessagesJob = encryptedMessages.received.map(msg => ({
          date: new Date(msg.created_at),
          job: mapMessageTaskFactory(msg => msg.recipient_key)(msg)
        }))
        const sendMessagesJob = encryptedMessages.send.map(msg => ({
          date: new Date(msg.created_at),
          job: mapMessageTaskFactory(msg => msg.sender_key)(msg)
        }))

        const allMessages = [...recMessagesJob, ...sendMessagesJob];

        allMessages.sort((a, b) => b.date.getTime() - a.date.getTime())


        for (const message of allMessages) {
          const decryptedMessage = await message.job();
          observer.next(decryptedMessage);
        }
        observer.complete();
      })()
    })
  }

  async sendFile(file: File, publicKey: CryptoKey) {
    const ownPublicKey = await this.contactService.getOwnKey().then(r => r?.publicKey);
    if (!ownPublicKey) return;
    const {
      ownEncryptedKey,
      encryptedData,
      encryptedKey,
      iv
    } = await this.encryptionService.encryptFile(file, publicKey, ownPublicKey);
    const response = await fetch(this.baseUrl + '/upload', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        encrypted_data: encryptedData,
        recipient_key: encryptedKey,
        sender_key: ownEncryptedKey,
        recipient_public_key: await this.keyService.keyToBase64(publicKey),
        sender_public_key: await this.keyService.keyToBase64(ownPublicKey),
        iv: iv
      } as Message)
    });
  }

  async registerKey() {
    const keyPair = await this.contactService.getOwnKey();
    if (!keyPair) return;
    const public_key = await this.keyService.keyToBase64(keyPair.publicKey);
    const hash = await this.keyService.generateHash(public_key);
    await fetch(this.baseUrl + '/register-key', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({hash: hash, public_key: public_key}),
    })
  }

  async searchForKey(hash: string): Promise<{ hash: string, public_key: string }> {
    const res = await fetch(this.baseUrl + '/key-search', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({hash})
    });
    return await res.json();
  }
}
