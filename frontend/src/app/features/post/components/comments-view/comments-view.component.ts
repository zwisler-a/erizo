import {Component, Input} from '@angular/core';
import {AliasPipePipe} from "../../../../shared/pipes/alias.pipe";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {DecryptedPost} from '../../types/decrypted-post.interface';
import {PostService} from '../../services/post.service';

@Component({
  selector: 'app-comments-view',
  imports: [
    AliasPipePipe,
    MatIcon,
    MatIconButton,
    NgForOf,
    NgIf
  ],
  templateUrl: './comments-view.component.html',
  styleUrl: './comments-view.component.css'
})
export class CommentsViewComponent {

  @Input() post!: DecryptedPost;
  showNewComment: boolean = false;

  constructor(
    private postService: PostService,
  ) {
  }

  commentPost(value: string) {
    if (!value) return;
    if (!this.post) return;
    this.postService.comment(this.post.id, this.post.thread.participants, value);
    this.showNewComment = false;
  }

}
