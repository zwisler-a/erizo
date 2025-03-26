import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../service/contact.service';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CompleteMessage, MessageService } from '../../service/message.service';
import { firstValueFrom, Observable } from 'rxjs';
import { KeyService } from '../../service/key.service';
import { ConnectionEntity } from '../../api/models/connection-entity';
import { LightboxDirective } from './lighbox.directive';

@Component({
  selector: 'app-connection-view',
  imports: [
    MatButton,
    MatIcon,
    AsyncPipe,
    LightboxDirective,
  ],
  templateUrl: './connection-view.component.html',
  styleUrl: './connection-view.component.css',
})
export class ConnectionViewComponent {
  public contact?: (ConnectionEntity & { alias: string });
  messages$?: Observable<CompleteMessage[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private keyService: KeyService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
  ) {
    const fingerprint = this.route.snapshot.paramMap.get('fingerprint');
    if (!fingerprint) {
      this.router.navigateByUrl('/');
    } else {
      this.loadContact(fingerprint).then(() => {
        this.initImages();
      });
    }
  }


  private async loadContact(fingerprint: string) {
    this.contact = await firstValueFrom(this.contactService.getContact(fingerprint));
    if (!this.contact) {
      this.router.navigateByUrl('/');
    }
  }

  sendImage() {
    this.router.navigate(['/upload', this.contact?.connectedWith.fingerprint ?? '']);
  }


  async initImages() {
    const myFp = await this.keyService.getOwnFingerprint();
    const youFp = this.contact?.connectedWith.fingerprint;
    if (!youFp || !myFp) return;

    this.messages$ = this.messageService.getAllMessagesFor(this.contact?.chat?.id ?? 0);

  }

}
