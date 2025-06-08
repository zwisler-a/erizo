import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from '../model/like.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../authentication/model/user.entity';
import { NotificationService, NotificationType } from '../../notification/service/notification.service';
import { PostEntity } from '../model/post.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    @InjectRepository(PostEntity) private postRepo: Repository<PostEntity>,
    private notificationService: NotificationService,
  ) {}

  async addLike(postId: number, user: UserEntity) {
    const post = await this.postRepo.findOneOrFail({
      where: { id: postId },
      relations: { decryptionKeys: true },
    });
    const canSeePost = post.decryptionKeys.some((recipient) => recipient.recipient_fingerprint == user.fingerprint);
    if (!canSeePost) throw new UnauthorizedException();

    const like = this.likeRepository.create({ user, postId });
    await this.likeRepository.save(like);
    await this.notificationService.notify(
      { fingerprint: post.sender_fingerprint },
      {
        fingerprint: user.fingerprint,
        type: NotificationType.LIKE_POST,
        post_id: postId.toString(),
      },
    );
  }

  async removeLike(userFingerprint: string, postId: number): Promise<void> {
    await this.likeRepository.delete({ userFingerprint, postId });
  }
}
