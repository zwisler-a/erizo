import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {Router, RouterLink} from '@angular/router';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatMiniFabButton} from '@angular/material/button';
import {ThreadListComponent} from '../../../thread/components/thread-list/thread-list.component';
import {PullToRefreshComponent} from '../../../../shared/components/pull-to-refresh/pull-to-refresh.component';
import {Observable, Subject} from 'rxjs';
import {ConnectionEntity} from '../../../../api/models/connection-entity';
import {ContactService} from '../../services/contact.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ThreadEntity} from '../../../../api/models/thread-entity';
import {URLS} from '../../../../app.routes';
import {ConnectionOptionsComponent} from '../connection-options/connection-options.component';
import {ThreadService} from '../../../thread/services/thread.service';


@Component({
  selector: 'app-connections-page',
  imports: [MatListModule, RouterLink, NgIf, MatIcon, MatMenuModule, AsyncPipe, MatMiniFabButton, ThreadListComponent, PullToRefreshComponent],
  templateUrl: './connections-page.component.html',
  styleUrl: './connections-page.component.css',
})
export class ConnectionsPageComponent {
  openRequests$: Observable<(ConnectionEntity)[]>;

  constructor(
    private contactService: ContactService,
    private threadService: ThreadService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
  ) {
    this.openRequests$ = contactService.getOpenRequests();
  }


  navigateToThread(thread: ThreadEntity) {
    this.router.navigateByUrl(URLS.THREAD_FN(thread.id));
  }

  refresh($event: Subject<any>) {
    this.contactService.refresh();
    this.threadService.refresh();
    setTimeout(() => {
      $event.next('');
    }, 100);
  }


  openBottomSheet(): void {
    this.bottomSheet.open(ConnectionOptionsComponent);
  }

  protected readonly URLS = URLS;


}
