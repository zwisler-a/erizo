import {Component} from '@angular/core';
import {Contact, ContactService} from '../service/contact.service';
import {MatListModule} from '@angular/material/list';
import {NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {KeyService} from '../service/key.service';
import {MatIcon} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-connection-list-view',
  imports: [MatListModule, RouterLink, NgIf, MatIcon, MatMenuModule, MatIconButton],
  templateUrl: './connection-list-view.component.html',
  styleUrl: './connection-list-view.component.css'
})
export class ConnectionListViewComponent {
  contacts!: Contact[];

  constructor(
    private contactService: ContactService,
    private keyService: KeyService
  ) {
    this.loadContacts()
  }

  async loadContacts() {
    this.contacts = await this.contactService.getContacts()
  }


  async deleteContact(contact: Contact) {
    await this.contactService.deleteContact(contact);
    this.loadContacts()
  }
}
