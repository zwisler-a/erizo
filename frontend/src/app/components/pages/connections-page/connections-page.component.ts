import {Component} from '@angular/core';
import {ContactService} from '../../../service/contact.service';
import {MatListModule} from '@angular/material/list';
import {AsyncPipe, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {Observable} from 'rxjs';
import {ConnectionEntity} from '../../../api/models/connection-entity';
import {ConfirmationService} from '../../../service/confirmation.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {URLS} from '../../../app.routes';
import {UserService} from '../../../service/user.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ConnectionOptionsComponent} from './connection-options/connection-options.component';
import {ThreadEntity} from '../../../api/models/thread-entity';
import {ThreadService} from '../../../service/thread.service';
import {ThreadListComponent} from '../../shared/thread-list/thread-list.component';

@Component({
  selector: 'app-connections-page',
  imports: [MatListModule, RouterLink, NgIf, MatIcon, MatMenuModule, MatIconButton, AsyncPipe, MatButton, MatProgressSpinner, MatMiniFabButton, ThreadListComponent],
  templateUrl: './connections-page.component.html',
  styleUrl: './connections-page.component.css',
})
export class ConnectionsPageComponent {
  openRequests$: Observable<(ConnectionEntity)[]>;

  constructor(
    contactService: ContactService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
  ) {
    this.openRequests$ = contactService.getOpenRequests();
  }


  navigateToThread(thread: ThreadEntity) {
    this.router.navigateByUrl(URLS.THREAD_FN(thread.id))
  }


  openBottomSheet(): void {
    this.bottomSheet.open(ConnectionOptionsComponent);
  }

  protected readonly URLS = URLS;

}
