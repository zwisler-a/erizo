import { Component } from '@angular/core';
import { ContactService } from '../../service/contact.service';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { Observable } from 'rxjs';
import { ConnectionEntity } from '../../api/models/connection-entity';

@Component({
  selector: 'app-connection-list-view',
  imports: [MatListModule, RouterLink, NgIf, MatIcon, MatMenuModule, MatIconButton, AsyncPipe],
  templateUrl: './connection-list-view.component.html',
  styleUrl: './connection-list-view.component.css',
})
export class ConnectionListViewComponent {
  contacts$: Observable<(ConnectionEntity & { alias: string })[]>;

  constructor(
    private contactService: ContactService,
  ) {
    this.contacts$ = this.contactService.getContacts();
  }

}
