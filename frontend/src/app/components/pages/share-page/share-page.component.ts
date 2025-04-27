import {Component, OnInit} from '@angular/core';
import {ThreadListComponent} from '../../shared/thread-list/thread-list.component';
import {ThreadEntity} from '../../../api/models/thread-entity';
import {Router} from '@angular/router';
import {URLS} from '../../../app.routes';

@Component({
  selector: 'app-share-page',
  imports: [
    ThreadListComponent
  ],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.css'
})
export class SharePageComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  selected(thread: ThreadEntity) {
    this.router.navigateByUrl(URLS.UPLOAD_IMAGE_FN(thread.id.toString()));
  }
}
