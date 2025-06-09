import {Component, OnInit} from '@angular/core';
import {ThreadListComponent} from '../../../thread/components/thread-list/thread-list.component';
import {UploadPostJourneyService} from '../../services/upload-post-journey.service';
import {ThreadEntity} from '../../../../api/models/thread-entity';


@Component({
  selector: 'app-share-page',
  imports: [
    ThreadListComponent
  ],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.css'
})
export class SharePageComponent implements OnInit {

  constructor(private postJourney: UploadPostJourneyService) {
  }

  ngOnInit() {
  }

  selected(thread: ThreadEntity) {
    this.postJourney.selectThread(thread.id);
  }
}
