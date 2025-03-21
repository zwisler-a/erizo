import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {CompleteMessage, MessageService} from '../service/message.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AsyncPipe, DatePipe, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {Message} from '../types/message';
import {Observable} from 'rxjs';
import {DecryptedMessage} from '../service/encryption.service';

@Component({
  selector: 'app-home-view',
  imports: [MatButtonModule, RouterLink, MatProgressSpinnerModule, NgIf, MatIconModule, DatePipe, AsyncPipe],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.css'
})
export class HomeViewComponent {
  messages$: Observable<CompleteMessage[]>;
  loading = false;

  constructor(
    private messageService: MessageService
  ) {
    this.messages$ = this.messageService.getAllMessages();
  }

}
