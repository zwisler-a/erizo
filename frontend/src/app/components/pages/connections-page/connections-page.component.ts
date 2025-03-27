import { Component } from '@angular/core';
import { ContactService } from '../../../service/contact.service';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { Observable } from 'rxjs';
import { ConnectionEntity } from '../../../api/models/connection-entity';
import { ConfirmationService } from '../../../service/confirmation.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { URLS } from '../../../app.routes';
import { UserService } from '../../../service/user.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ConnectionOptionsComponent } from './connection-options/connection-options.component';
import { ThreadEntity } from '../../../api/models/thread-entity';

@Component({
  selector: 'app-connections-page',
  imports: [MatListModule, RouterLink, NgIf, MatIcon, MatMenuModule, MatIconButton, AsyncPipe, MatButton, MatProgressSpinner, MatMiniFabButton],
  templateUrl: './connections-page.component.html',
  styleUrl: './connections-page.component.css',
})
export class ConnectionsPageComponent {
  connections$: Observable<(ConnectionEntity & { alias: string })[]>;
  openRequests$: Observable<(ConnectionEntity)[]>;
  threads$: Observable<ThreadEntity[]>;

  constructor(
    private contactService: ContactService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private bottomSheet: MatBottomSheet,
  ) {
    this.connections$ = this.contactService.getContacts();
    this.threads$ = this.contactService.getThreads();
    this.openRequests$ = contactService.getOpenRequests();
  }

  deleteConnection(id: number) {
    this.confirmationService.confirm('Delete???').subscribe(
      result => {
        if (result) {
          this.contactService.delete(id).subscribe(() => {
            this.connections$ = this.contactService.getContacts();
          });
        }
      },
    );

  }

  changeAlias(connection: ConnectionEntity & { alias: string }) {
    this.confirmationService.confirmWithInput('Alias', connection.connectedWith.fingerprint).subscribe(async res => {
      await this.contactService.addAlias(connection.connectedWith.fingerprint, res);
      this.connections$ = this.contactService.getContacts();
    });
  }

  shareIdentity() {
    this.userService.shareIdentity();
  }


  openBottomSheet(): void {
    this.bottomSheet.open(ConnectionOptionsComponent);
  }

  protected readonly URLS = URLS;

  deleteThread(id: number) {
    this.confirmationService.confirm('Delete???').subscribe(
      result => {
        if (result) {
          this.contactService.deleteThread(id).subscribe(() => {
            this.threads$ = this.contactService.getThreads();
          });
        }
      },
    );
  }
}
