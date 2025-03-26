import { Component } from '@angular/core';
import { ContactService } from '../../service/contact.service';
import { Observable } from 'rxjs';
import { ConnectionEntity } from '../../api/models/connection-entity';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatListItem, MatNavList } from '@angular/material/list';

@Component({
  selector: 'app-connection-request-view',
  imports: [
    AsyncPipe,
    MatIcon,
    RouterLink,
    MatListItem,
    MatNavList,
    NgIf,
  ],
  templateUrl: './connection-request-view.component.html',
  styleUrl: './connection-request-view.component.css',
})
export class ConnectionRequestViewComponent {
  connections$: Observable<(ConnectionEntity)[]>;

  constructor(private contactService: ContactService) {
    this.connections$ = contactService.getOpenRequests();
  }

}
