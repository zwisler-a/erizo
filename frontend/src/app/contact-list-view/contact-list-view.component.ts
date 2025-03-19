import {Component} from '@angular/core';
import {ContactService} from '../service/contact.service';
import {MatListModule} from '@angular/material/list';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {KeyService} from '../service/key.service';

@Component({
  selector: 'app-contact-list-view',
  imports: [MatListModule, RouterLink],
  templateUrl: './contact-list-view.component.html',
  styleUrl: './contact-list-view.component.css'
})
export class ContactListViewComponent {
  contacts!: { alias: string; publicKey: string, hash: string }[];

  constructor(
    private contactService: ContactService,
    private keyService: KeyService
  ) {
    this.loadContacts()
  }

  async loadContacts() {
    const contacts = await this.contactService.getContacts()
    this.contacts = await Promise.all(contacts.map(async contact => ({
      ...contact,
      hash: await this.keyService.generateHash(contact.publicKey)
    })));
  }


}
