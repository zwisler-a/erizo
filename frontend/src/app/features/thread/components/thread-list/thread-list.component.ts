import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';

import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {ThreadEntity} from '../../../../api/models/thread-entity';
import {ConnectionEntity} from '../../../../api/models/connection-entity';
import {ThreadService} from '../../services/thread.service';
import {ConfirmationService} from '../../../../shared/services/confirmation.service';
import {ContactService} from '../../../connection/services/contact.service';
import { URLS } from '../../../../app.routes';

@Component({
  selector: 'app-thread-list',
  imports: [MatListModule, MatIconModule, MatMenuModule, NgIf, AsyncPipe, MatButtonModule, MatProgressSpinner, RouterLink],
  templateUrl: './thread-list.component.html',
  styleUrl: './thread-list.component.css'
})
export class ThreadListComponent {

  threads$: Observable<ThreadEntity[]>;
  connections$: Observable<(ConnectionEntity & { alias: string })[]>;

  @Input("allowMenu") allowMenu: boolean = true;

  @Output() public onClick = new EventEmitter<ThreadEntity>();

  constructor(
    private threadService: ThreadService,
    private confirmationService: ConfirmationService,
    private contactService: ContactService
  ) {
    this.threads$ = this.threadService.getThreads();
    this.connections$ = this.contactService.getContacts();
  }

  deleteConnection(id: number) {
    this.confirmationService.confirm('Delete???').subscribe(
      result => {
        if (result) {
          this.contactService.delete(id).subscribe(() => {

          });
        }
      },
    );

  }

  changeAlias(connection: ConnectionEntity & { alias: string }) {
    this.confirmationService.confirmWithInput('Alias', connection.connectedWith.fingerprint).subscribe(async res => {
      await this.contactService.addAlias(connection.id, res);

    });
  }

  deleteThread(id: number) {
    this.confirmationService.confirm('Delete???').subscribe(
      result => {
        if (result) {
          this.threadService.deleteThread(id).subscribe(() => {
            this.threads$ = this.threadService.getThreads();
          });
        }
      },
    );
  }

  protected readonly URLS = URLS;
}
