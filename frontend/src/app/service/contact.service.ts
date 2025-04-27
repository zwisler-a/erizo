import {Injectable} from '@angular/core';
import {PersistenceService} from './persistence.service';
import {
  BehaviorSubject,
  EMPTY,
  firstValueFrom,
  map,
  Observable,
  OperatorFunction,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';
import {ApiConnectionService} from '../api/services/api-connection.service';
import {ConnectionEntity} from '../api/models/connection-entity';
import {KeyService} from './key.service';
import {ApiThreadService} from '../api/services/api-thread.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError} from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class ContactService {

  private reloadContacts$ = new BehaviorSubject<null>(null);
  private contracts$ = this.reloadContacts$.pipe(
    switchMap(() => this.connectionApi.getConnections()),
    shareReplay(1)
  )

  constructor(
    private connectionApi: ApiConnectionService,
    private keyService: KeyService,
    private snackBar: MatSnackBar,
  ) {
  }

  requestContactConnection(fingerprint: string, alias: string) {
    return this.connectionApi.request({body: {partner_fingerprint: fingerprint, alias}}).pipe(
      tap(() => this.reloadContacts$.next(null))
    );
  }

  getOpenRequests() {
    return this.connectionApi.openRequest();
  }

  getContacts(): Observable<(ConnectionEntity & { alias: string })[]> {
    return this.contracts$;
  }

  acceptContactRequest(fingerprint: string, alias: string) {
    return this.getOpenRequests().pipe(
      map((openRequests) => openRequests.find(request => request.owner.fingerprint === fingerprint)),
      map((openRequest) => {
        if (!openRequest) throw new Error('No open request found! Did you already accept the request?');
        return openRequest;
      }),
      switchMap((openRequest) => this.connectionApi.acceptRequest({body: {requestId: openRequest.id, alias}})),
      tap(() => this.reloadContacts$.next(null)),
      catchError((err: any) => {
        this.snackBar.open(err.message, "Let me check");
        return EMPTY
      })
    );
  }

  async addAlias(id: number, alias: string) {
    const res = await firstValueFrom(this.connectionApi.setAlias({body: {alias, id}}));
    this.reloadContacts$.next(null);
    return res;
  }

  getAlias(fingerprint: string): Promise<string | null> {
    return new Promise(async resolve => {
      if((await this.keyService.getOwnFingerprint()) == fingerprint) {
        resolve("You");
        return;
      }
      this.contracts$.subscribe(contacts => {
        const matchingContact = contacts.find(contact => contact.connectedWith.fingerprint === fingerprint);
        resolve(matchingContact?.alias ?? matchingContact?.connectedWith.fingerprint ?? null);
      })
    })
  }

  delete(id: number) {
    return this.connectionApi.deleteConnection({body: {connectionId: id}}).pipe(
      tap(() => this.reloadContacts$.next(null))
    );
  }
}
