import {Component, ElementRef, HostListener} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {CompletePost, PostFeed, PostService} from '../../../service/post.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {firstValueFrom, Observable} from 'rxjs';
import {PostComponent} from '../../shared/post/post.component';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf, MatIconModule, AsyncPipe, PostComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  feed: PostFeed;

  constructor(
    private postService: PostService,
    private el: ElementRef
  ) {
    this.feed = this.postService.homeFeed;
    this.postService.homeFeed.next();
  }

  @HostListener('window:scroll', ['$event'])
  async onScroll(event: any) {
    const element = this.el.nativeElement;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = element.offsetTop + element.clientHeight - 500;

    if (scrollPosition >= threshold) {
      if (!this.postService.homeFeed.loading$.value && !this.postService.homeFeed.endOfFeed$.value) {
        this.postService.homeFeed.next();
      }
    }
  }

}
