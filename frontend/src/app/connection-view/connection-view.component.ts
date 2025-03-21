import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ActivatedRoute, Router} from '@angular/router';
import {Contact, ContactService} from '../service/contact.service';
import {AsyncPipe, DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {Message} from '../types/message';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {CompleteMessage, MessageService} from '../service/message.service';
import {map, merge, mergeAll, mergeMap, Observable} from 'rxjs';
import {KeyService} from '../service/key.service';

@Component({
  selector: 'app-connection-view',
  imports: [
    MatButton,
    DatePipe,
    MatIcon,
    AsyncPipe
  ],
  templateUrl: './connection-view.component.html',
  styleUrl: './connection-view.component.css'
})
export class ConnectionViewComponent {
  public contact?: Contact;
  messages$?: Observable<CompleteMessage[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private keyService: KeyService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    const fingerprint = this.route.snapshot.paramMap.get('fingerprint')
    if (!fingerprint) {
      this.router.navigateByUrl("/");
    } else {
      this.loadContact(fingerprint).then(() => {
        this.initImages();
      });
    }
  }


  private async loadContact(fingerprint: string) {
    this.contact = await this.contactService.getContact(fingerprint);
    if (!this.contact) {
      this.router.navigateByUrl("/");
    }
  }

  sendImage() {
    this.router.navigate(["/upload", this.contact?.fingerprint ?? '']);
  }


  async initImages() {
    const myFp = await this.keyService.getOwnFingerprint();
    const youFp = this.contact?.fingerprint;
    if (!youFp || !myFp) return;

    this.messages$ = this.messageService.getAllMessagesFor([myFp, youFp])

  }

}
