import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgxPullToRefreshComponent } from 'ngx-pull-to-refresh';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-pull-to-refresh',
  imports: [
    NgxPullToRefreshComponent,

  ],
  templateUrl: './pull-to-refresh.component.html',
  styleUrl: './pull-to-refresh.component.css',
})
export class PullToRefreshComponent implements OnInit {

  targetElement: Element | null = null;

  @Output() pullToRefresh = new EventEmitter<Subject<any>>();

  ngOnInit() {
    this.targetElement = document.querySelector('html');
  }

  async refresh(event: Subject<any>) {
    this.pullToRefresh.emit(event);
  }

}
