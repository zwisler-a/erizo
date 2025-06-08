import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CompletePost, PostFeed, PostService } from '../../../service/post.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { PostComponent } from '../../shared/post/post.component';
import { NgxPullToRefreshComponent } from 'ngx-pull-to-refresh';
import { PullToRefreshComponent } from '../../shared/pull-to-refresh/pull-to-refresh.component';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf, MatIconModule, AsyncPipe, PostComponent, NgxPullToRefreshComponent, PullToRefreshComponent],
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
