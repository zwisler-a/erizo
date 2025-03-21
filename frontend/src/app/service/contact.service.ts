import {Injectable} from '@angular/core';
import {PersistenceService} from './persistence.service';
import {KeyService} from './key.service';
import {HttpClient} from '@angular/common/http';
import {BASE_PATH} from './constants';
import {catchError, switchMap, tap, throwError} from 'rxjs';
import {ChallengeService} from './challenge.service';
import {NotificationService} from './notification.service';
import {MatSnackBar} from '@angular/material/snack-bar';

const CONTACTS_STORE = 'CONTACTS_STORE';

export interface Contact {
  alias: string;
  fingerprint: string;
  publicKey: string;
  state?: 'pending' | 'rejected' | 'connected';
}

@Injectable({providedIn: 'root'})
export class ContactService {

  private readonly key = "CONTACTS_STORE";
  private registeredRequestFingerprints: string[] = [];

  constructor(
    private persistenceService: PersistenceService,
    private challengeService: ChallengeService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
  }


  async addContact(contact: Contact): Promise<void> {
    const contacts = (await this.persistenceService.getItem<Contact[]>(this.key)) ?? []
    contacts.push(contact)
    await this.persistenceService.setItem(CONTACTS_STORE, contacts);
  }

  requestContactConnection(alias: string, fingerprint: string) {
    return this.challengeService.getChallengeToken().pipe(
      switchMap(token => this.http.post(`${BASE_PATH}/link-request`, {...token, partner_fingerprint: fingerprint})),
      catchError(err => {
        this.snackBar.open("Something went wrong: " + err.error.message, undefined, {duration: 2000});
        throw err;
      }),
      tap(_ =>
        this.addContact({
          alias,
          fingerprint,
          publicKey: 'unset',
          state: 'pending'
        })
      )
    );
  }

  async syncContacts() {
    this.getConfirmedConnections().subscribe((connections: any) => {
      connections.forEach(async (connection: any) => {
        const conFp = connection.requester.fingerprint;
        const con = await this.updateIfExisting(conFp, "connected", connection.requester.public_key);
        if (!con) return;
        this.notificationService.addNotification({
          title: `${con?.alias} like you too`,
          description: `You are now connected with ${con?.alias} 🪅`,
          icon: "account_circle",
          link: '/connection/' + connection.requester.fingerprint,
        });
      })
    })
    this.getConnectionRequests().subscribe((connection: any) => {
      connection.forEach(async (connection: any) => {
        if (this.registeredRequestFingerprints.includes(connection.requester.fingerprint)) return;
        this.registeredRequestFingerprints.push(connection.requester.fingerprint);
        this.notificationService.addNotification({
          title: "Someone likes you",
          description: "Someone wants to add you to your contacts 😊",
          icon: "account_circle",
          link: '/add-contact/' + connection.requester.fingerprint,
        });
      })

    })

  }

  private async updateIfExisting(conFp: string, state: "pending" | "rejected" | "connected", publicKey: string) {
    const contacts = await this.getContacts();

    const con = contacts.find(contact => contact.fingerprint === conFp);
    if (!con || con.state != 'pending') return;
    con.state = state;
    con.publicKey = publicKey;

    await this.persistenceService.setItem(CONTACTS_STORE, contacts);
    return con;
  }

  getConnectionRequests() {
    return this.challengeService.getChallengeToken().pipe(
      switchMap(token => this.http.post(`${BASE_PATH}/link-request/open`, {...token}))
    );
  }

  getConfirmedConnections() {
    return this.challengeService.getChallengeToken().pipe(
      switchMap(token => this.http.post(`${BASE_PATH}/link-request/confirmed`, {...token}))
    );
  }

  async getContacts(): Promise<Contact[]> {
    return (await this.persistenceService.getItem<Contact[]>(this.key)) ?? [];
  }

  async getContact(fingerprint: string) {
    const contacts = await this.getContacts();
    return contacts.find(contact => contact.fingerprint == fingerprint);
  }


  async deleteContact(contact: Contact) {
    const contacts = await this.persistenceService.getItem<Contact[]>(CONTACTS_STORE);
    if (!contacts) return;
    const updatedContacts = contacts.filter(c => c.fingerprint !== contact.fingerprint);
    await this.persistenceService.setItem(CONTACTS_STORE, updatedContacts);
  }
}
