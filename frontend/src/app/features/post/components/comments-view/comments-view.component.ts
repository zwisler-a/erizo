import {Component, Inject, Input, Optional} from '@angular/core';
import {AliasPipePipe} from "../../../../shared/pipes/alias.pipe";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {DecryptedPost} from '../../types/decrypted-post.interface';
import {PostService} from '../../services/post.service';
import {
    MAT_BOTTOM_SHEET_DATA,
    MatBottomSheet,
    MatBottomSheetModule,
    MatBottomSheetRef
} from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-comments-view',
    imports: [
        AliasPipePipe,
        MatIcon,
        MatIconButton,
        NgForOf,
        NgIf,
        MatBottomSheetModule
    ],
    templateUrl: './comments-view.component.html',
    styleUrl: './comments-view.component.css'
})
export class CommentsViewComponent {

    @Input() post!: DecryptedPost;
    showNewComment: boolean = false;

    @Input() limit = 0;

    constructor(
        private postService: PostService,
        private bottomSheet: MatBottomSheet,
        @Optional() private bottomSheetRef: MatBottomSheetRef<CommentsViewComponent>,
        @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public data: any = {}
    ) {
        if (data && data['post']) {
            this.post = data['post'];
            this.showNewComment = true;
        }
    }

    async commentPost(value: string) {
        if (!value) return;
        if (!this.post) return;
        await this.postService.comment(this.post.id, this.post.thread.participants, value);
        this.showNewComment = false;
        if (this.bottomSheetRef) {
            this.bottomSheetRef.dismiss();
        }
    }

    getLimitedComments(comments: any[]) {
        if (!comments) return [];
        return this.limit > 0 ? comments.slice(-this.limit) : comments;
    }

    openBottomSheet() {
        if (this.bottomSheetRef || this.data) return;
        const bottomSheetRef = this.bottomSheet.open(CommentsViewComponent, {
            data: {post: this.post},
            ariaLabel: 'Comments',
            panelClass: 'bottomsheet-comments',
        });
    }
}
