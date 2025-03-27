import { Injectable } from '@angular/core';
import { PersistenceService } from './persistence.service';
import { map, Observable, OperatorFunction, switchMap } from 'rxjs';
import { ApiConnectionService } from '../api/services/api-connection.service';
import { ConnectionEntity } from '../api/models/connection-entity';
import { KeyService } from './key.service';


@Injectable({ providedIn: 'root' })
export class ContactService {

  constructor(
    private connectionApi: ApiConnectionService,
    private persistenceService: PersistenceService,
    private keyService: KeyService,
  ) {
  }

  requestContactConnection(fingerprint: string) {
    return this.connectionApi.request({ body: { partner_fingerprint: fingerprint } });
  }

  getOpenRequests() {
    return this.connectionApi.openRequest();
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
    if ((await this.keyService.getOwnFingerprint()) == fingerprint) return 'You';
    const aliases = (await this.persistenceService.getItem('alias') ?? {}) as Record<string, string>;

    return aliases[fingerprint];
  }

  delete(id: number) {
    return this.connectionApi.deleteConnection({ body: { connectionId: id } });
  }
}
