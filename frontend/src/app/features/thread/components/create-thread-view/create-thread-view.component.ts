import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {ConnectionEntity} from '../../../../api/models/connection-entity';
import {AsyncPipe} from '@angular/common';
import {MatListOption, MatSelectionList} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {URLS} from '../../../../app.routes';
import {AliasPipePipe} from '../../../../shared/pipes/alias.pipe';
import {ContactService} from '../../../connection/services/contact.service';
import {ThreadService} from '../../services/thread.service';

@Component({
  selector: 'app-create-thread-view',
  imports: [
    AsyncPipe,
    MatSelectionList,
    MatListOption,
    AliasPipePipe,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    RouterLink,
  ],
  templateUrl: './create-thread-view.component.html',
  styleUrl: './create-thread-view.component.css',
})
export class CreateThreadViewComponent {
  contacts$: Observable<(ConnectionEntity & { alias: string })[]>;
  name: string = '';

  constructor(
    private contactService: ContactService,
    private threadService: ThreadService,
    private router: Router
  ) {
    this.contacts$ = this.contactService.getContacts();
  }

  protected readonly URLS = URLS;

  createThread(contactsList: MatSelectionList) {
    const participants: string[] = contactsList.selectedOptions.selected.map(s => s.value);
    this.threadService.createThread({body: {participants, name: this.name}}).subscribe(() => {
      this.router.navigateByUrl('/' + URLS.CONNECTIONS);
    });
  }
}
