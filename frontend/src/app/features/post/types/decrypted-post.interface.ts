import {PostDto} from '../../../api/models/post-dto';
import {CommentEntity} from '../../../api/models/comment-entity';
import {SafeUrl} from '@angular/platform-browser';

export interface DecryptedPost extends PostDto {
  decryptedData: ArrayBuffer;
  decryptedMessage: string;
  decryptedComments: CommentEntity[];
  imageUrl: SafeUrl;
}
