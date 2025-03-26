import { Component } from '@angular/core';
import { ContactService } from '../../service/contact.service';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { Observable } from 'rxjs';
import { ConnectionEntity } from '../../api/models/connection-entity';
import { deleteConnection } from '../../api/fn/connection/delete-connection';
import { ConfirmationService } from '../../service/confirmation.service';

@Component({
  selector: 'app-connection-list-view',
  imports: [MatListModule, RouterLink, NgIf, MatIcon, MatMenuModule, MatIconButton, AsyncPipe, MatButton],
  templateUrl: './connection-list-view.component.html',
  styleUrl: './connection-list-view.component.css',
})
export class ConnectionListViewComponent {
  connections$: Observable<(ConnectionEntity & { alias: string })[]>;

  constructor(
    private contactService: ContactService,
    private confirmationService: ConfirmationService,
  ) {
    this.connections$ = this.contactService.getContacts();
  }

  deleteConnection(id: number) {
    this.confirmationService.confirm("Delete???").subscribe(
      result => {
        if (result) {
          this.contactService.delete(id).subscribe(()=>{
            this.connections$ = this.contactService.getContacts();
          });
        }
      }
    )

  }

  changeAlias(connection: ConnectionEntity & { alias: string }) {
    this.confirmationService.confirmWithInput("Alias", connection.connectedWith.fingerprint).subscribe(async res => {
      await this.contactService.addAlias(connection.connectedWith.fingerprint, res)
      this.connections$ = this.contactService.getContacts();
    })
  }
}
