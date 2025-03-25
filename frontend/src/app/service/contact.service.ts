import { Injectable } from '@angular/core';
import { PersistenceService } from './persistence.service';
import { map, Observable, OperatorFunction, switchMap } from 'rxjs';
import { NotificationService } from './notification.service';
import { ApiConnectionService } from '../api/services/api-connection.service';
import { ConnectionEntity } from '../api/models/connection-entity';

const CONTACTS_STORE = 'CONTACTS_STORE';


@Injectable({ providedIn: 'root' })
export class ContactService {

  constructor(
    private connectionApi: ApiConnectionService,
    private notificationService: NotificationService,
    private persistenceService: PersistenceService,
  ) {
  }

  requestContactConnection(fingerprint: string) {
    return this.connectionApi.request({ body: { partner_fingerprint: fingerprint } });
  }

  getOpenRequests() {
    return this.connectionApi.openRequest();
  }

  showOpenRequestsInNotifications() {
    this.getOpenRequests().subscribe((openRequests) => {
      openRequests.forEach((openRequest) => {
        this.notificationService.addNotification({
          icon: 'account_circle',
          title: 'Someone like you',
          description: 'Someone want to be connection with you :)',
          link: `/accept-contact/` + openRequest.owner.fingerprint,
        });
      });
    });
  }

  getContacts(): Observable<(ConnectionEntity & { alias: string })[]> {
    return this.connectionApi.getConnections().pipe(
      this.addAliasPipe(),
    );
  }

  getContact(fingerprint: string) {
    return this.getContacts().pipe(
      map((contacts) => contacts.find(contact => contact.connectedWith.fingerprint === fingerprint)),
    );
  }

  acceptContactRequest(fingerprint: string) {
    return this.getOpenRequests().pipe(
      map((openRequests) => openRequests.find(request => request.owner.fingerprint === fingerprint)),
      map((openRequest) => {
        if (!openRequest) throw new Error('Could not accept contact request');
        return openRequest;
      }),
      switchMap((openRequest) => this.connectionApi.acceptRequest({ body: { requestId: openRequest.id } })),
    );
  }

  private addAliasPipe(): OperatorFunction<ConnectionEntity[], (ConnectionEntity & { alias: string })[]> {
    return source => {
      return source.pipe(
        switchMap(vals => Promise.all(vals.map(async val => ({
          ...val,
          alias: (await this.getAlias(val.connectedWith.fingerprint) ?? val.connectedWith.fingerprint),
        })))),
      );
    };
  }

  async addAlias(fingerprint: string, alias: string) {
    if (!alias && !fingerprint) return;
    const aliases = (await this.persistenceService.getItem('alias') ?? {}) as Record<string, string>;
    aliases[fingerprint] = alias;
    await this.persistenceService.setItem('alias', aliases);
  }

  async getAlias(fingerprint: string): Promise<string | null> {
    const aliases = (await this.persistenceService.getItem('alias') ?? {}) as Record<string, string>;
    return aliases[fingerprint];
  }
}
