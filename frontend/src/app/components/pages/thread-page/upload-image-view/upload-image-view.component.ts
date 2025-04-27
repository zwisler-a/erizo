import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {PostService} from '../../../../service/post.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgIf} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {firstValueFrom} from 'rxjs';
import {ApiThreadService} from '../../../../api/services/api-thread.service';
import {ThreadEntity} from '../../../../api/models/thread-entity';

@Component({
  selector: 'app-upload-image-view',
  imports: [MatButtonModule, FormsModule, NgIf, MatCheckboxModule, MatTooltip, MatIcon, MatInputModule],
  templateUrl: './upload-image-view.component.html',
  styleUrl: './upload-image-view.component.css',
})
export class UploadImageViewComponent implements AfterViewInit {

  private thread: ThreadEntity | undefined;
  imageSrc: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  daysToLive?: number;
  message?: string;
  disableSend: boolean = false;
  nsfw: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private threadApi: ApiThreadService,
    private apiService: PostService,
    private snackBar: MatSnackBar,
  ) {
    const threadId = this.route.snapshot.paramMap.get('threadId');
    if (!threadId) {
      this.router.navigateByUrl('/');
    } else {
      this.loadThread(threadId);
    }
  }

  ngAfterViewInit(): void {
    const share = localStorage.getItem('share');
    if (share) {
      const {title, text, link, imageUrl} = JSON.parse(share);
      this.imageSrc = imageUrl;
      this.message = [title, text, link].join('\n');
    } else {
      this.fileInput.nativeElement.click();
    }
  }


  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imageSrc = reader.result as string;
      reader.readAsDataURL(file);
    }
  }


  private async loadThread(id: string) {
    this.thread = await firstValueFrom(this.threadApi.getThread({threadId: Number.parseInt(id)}));
    if (!this.thread) {
      this.router.navigateByUrl('/');
    }
  }

  async sendImage() {
    this.disableSend = true;
    if (this.fileInput?.nativeElement?.files?.length === 1 && this.thread) {
      await this.apiService.publishPost(
        this.fileInput?.nativeElement?.files[0],
        this.thread.id ?? 0,
        [...this.thread.participants],
        this.message,
        this.daysToLive,
        this.nsfw
      );
      this.snackBar.open('Image was posted successfully', undefined, {duration: 2500});
      this.router.navigateByUrl('/');
    }
    this.disableSend = false;
  }
}
