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
    if ('launchQueue' in window && 'files' in (window as any)) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (!launchParams) return;

        const formData: FormData = await launchParams.formData;
        const title = formData.get('name') as string;
        const text = formData.get('description') as string;
        const link = formData.get('link') as string;
        let imageUrl;
        const files = launchParams.files || [];
        for (const handle of files) {
          const file = await handle.getFile();
          imageUrl = URL.createObjectURL(file);
        }

        localStorage.setItem('share', JSON.stringify({
          title: title,
          text: text,
          link: link,
          imageUrl: imageUrl
        }));
      });
    }
  }

  selected(thread: ThreadEntity) {
    this.router.navigateByUrl(URLS.UPLOAD_IMAGE_FN(thread.id.toString()));
  }
}
