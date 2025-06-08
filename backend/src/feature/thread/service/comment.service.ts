import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '../model/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dto/post/comment.dto';
import { UserEntity } from '../../authentication/model/user.entity';
import { NotificationService, NotificationType } from '../../notification/service/notification.service';
import { PostService } from './post.service';
import { PostEntity } from '../model/post.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity) private postRepo: Repository<PostEntity>,
    private notificationService: NotificationService,
    private postService: PostService,
  ) {}

  async create(dto: CreateCommentDto): Promise<CommentEntity> {
    const comment = this.commentRepository.create({
      post: { id: dto.post_id },
      iv: dto.iv,
      decryptionKeys: dto.recipients.map((r) => ({
        encrypted_key: r.encryption_key,
        recipient_fingerprint: r.fingerprint,
      })),
      createdAt: new Date(),
      author: { fingerprint: dto.sender_fingerprint },
      content: dto.content,
    });
    const post = await this.postRepo.findOneOrFail({ where: { id: dto.post_id } });
    const doneComment = this.commentRepository.save(comment);
    await this.notificationService.notify(
      { fingerprint: post.sender_fingerprint },
      {
        type: NotificationType.NEW_COMMENT,
        post_id: post.id.toString(),
        fingerprint: dto.sender_fingerprint,
      },
    );
    return doneComment;
  }

  async findAll(postId: number, user: UserEntity): Promise<CommentEntity[]> {
    return this.commentRepository.find({
      where: {
        post: { id: postId },
        decryptionKeys: { recipient_fingerprint: user.fingerprint },
      },
      relations: { author: true, decryptionKeys: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
