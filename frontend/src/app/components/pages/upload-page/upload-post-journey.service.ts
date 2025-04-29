import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {URLS} from '../../../app.routes';
import {PostService} from '../../../service/post.service';
import {firstValueFrom} from 'rxjs';
import {ThreadService} from '../../../service/thread.service';
import {SendIntent} from 'send-intent';
import {Filesystem} from '@capacitor/filesystem';

@Injectable({providedIn: 'root'})
export class UploadPostJourneyService {

  previewPhoto?: string;
  isNsfw = false;
  message: string = "";
  deleteAfter = 0;
  threadId?: number = undefined;
  private isShare = false;


  constructor(
    private router: Router,
    private postService: PostService,
    private threadService: ThreadService) {

  }


  reset() {
    this.previewPhoto = '';
    this.isNsfw = false;
    this.message = "";
    this.deleteAfter = 0;
  }

  start(threadId: number): void {
    this.reset();
    this.threadId = threadId;
    this.router.navigateByUrl(URLS.TAKE_PHOTO);
  }

  setPhoto(image: string) {
    this.previewPhoto = image;
    this.router.navigateByUrl(URLS.SEND_POST);
  }

  async complete() {
    if (!this.threadId) throw new Error('Thread ID is missing');
    if (!this.previewPhoto) throw new Error('Photo is missing');
    const thread = await firstValueFrom(this.threadService.getThread(this.threadId))
    console.log(thread?.participants)
    if (!thread) throw new Error('Thread could not be found');
    await this.postService.publishPost(
      this.base64ToFile(this.previewPhoto, "image.png"),
      this.threadId,
      [...thread.participants],
      this.message,
      this.deleteAfter,
      this.isNsfw
    );
    if (!this.isShare) {
      this.router.navigateByUrl('/');
    } else {
      SendIntent.finish();
    }
  }


  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
  }

  retakePhoto() {
    this.start(this.threadId!);
  }

  startImageShare(imageUrl: string) {
    this.reset();
    this.previewPhoto = imageUrl;
    this.isShare = true;
    this.router.navigateByUrl(URLS.SHARE);
  }

  startMessageShare(message: string) {
    this.reset();
    this.message = message;
    this.isShare = true;
    this.router.navigateByUrl(URLS.SHARE);
  }

  selectThread(id: number) {
    this.threadId = id;
    if (this.previewPhoto) {
      this.router.navigateByUrl(URLS.SEND_POST);
    } else {
      this.router.navigateByUrl(URLS.TAKE_PHOTO);
    }
  }


  async checkShare() {
    SendIntent.checkSendIntentReceived().then(async (result: any) => {
      if (result.type === 'text/plain') {
        this.startMessageShare(result.text || result.title);
      }
      if (result.type && result.type.startsWith('image') && result.url) {
        const resultUrl = decodeURIComponent(result.url);
        try {
          const content = await Filesystem.readFile({path: resultUrl});
          const imageUrl = `data:image/jpeg;base64,${content.data}`;

          this.startImageShare(
            imageUrl
          );
        } catch (err) {
          alert(err)
        }

      }
    }).catch(err => console.error(err));
  }
}
