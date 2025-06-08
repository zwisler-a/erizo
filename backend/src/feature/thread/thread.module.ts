import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './model/post.entity';
import { CommentEntity } from './model/comment.entity';
import { LikeEntity } from './model/like.entity';
import { CommentDecryptionKeyEntity } from './model/comment-decryption-key.entity';
import { PostDecryptionKeyEntity } from './model/post-decryption-key.entity';
import { PostService } from './service/post.service';
import { CommentService } from './service/comment.service';
import { LikeService } from './service/like.service';
import { ThreadService } from './service/thread.service';
import { PostController } from './controller/post.controller';
import { ThreadController } from './controller/thread.controller';
import { NotificationModule } from '../notification/notification.module';
import { ThreadEntity } from './model/thread.entity';
import { FileService } from './service/file.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      CommentEntity,
      LikeEntity,
      ThreadEntity,
      CommentDecryptionKeyEntity,
      PostDecryptionKeyEntity,
    ]),
    NotificationModule,
    AuthenticationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PostController, ThreadController],
  providers: [ThreadService, PostService, CommentService, LikeService, FileService],
  exports: [ThreadService, PostService, CommentService, LikeService, FileService],
})
export class ThreadModule {}
