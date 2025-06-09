import {Component, ElementRef, HostListener} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {Subject} from 'rxjs';
import {PostComponent} from '../post/post.component';
import {PostService} from '../../services/post.service';
import {PullToRefreshComponent} from '../../../../shared/components/pull-to-refresh/pull-to-refresh.component';
import {PostFeed} from '../../services/post-feed.dto';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf, MatIconModule, AsyncPipe, PostComponent, PullToRefreshComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  feed: PostFeed;

  constructor(
    private postService: PostService,
    private el: ElementRef,
  ) {
    this.feed = this.postService.homeFeed;
    this.postService.homeFeed.next();
  }

  async refresh(event: Subject<any>) {
    this.feed.reset();
    await this.postService.clearImageCache();
    setTimeout(() => {
      this.postService.homeFeed.next();
      event.next('');
    }, 100);
  }

  @HostListener('window:scroll', ['$event'])
  async onScroll(_: any) {
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
