import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../persistance/post.entity';
import { Repository } from 'typeorm';
import { FilePointer, FileService } from './file.service';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { NotificationService, NotificationType } from './notification.service';
import { UserEntity } from '../persistance/user.entity';
import { DecryptionKeyEntity } from '../persistance/decryption-key.entity';

@Injectable()
export class PostService {
  constructor(
    private notificationService: NotificationService,
    @InjectRepository(PostEntity) private postRepo: Repository<PostEntity>,
    @InjectRepository(DecryptionKeyEntity) private decryptionKeyRepo: Repository<DecryptionKeyEntity>,
    private fileService: FileService,
  ) {}

  public async create(post: CreatePostDto, user: UserEntity): Promise<void> {
    const file = this.fileService.store(post.data);
    const postEntity = this.postRepo.create({
      decryptionKeys: post.recipients.map((recipient) => ({
        recipient_fingerprint: recipient.fingerprint,
        encrypted_key: recipient.encryption_key,
      })),
      chat: { id: post.chat_id },
      message: post.message,
      iv: post.iv,
      sender_fingerprint: user.fingerprint,
      file_path: file.relativePath,
      days_to_live: post.days_to_live,
      nsfw: post.nsfw ?? false,
    });
    await this.postRepo.save(postEntity);
    for (let recipient of post.recipients) {
      if (recipient.fingerprint !== user.fingerprint) {
        await this.notificationService.notify(
          { fingerprint: recipient.fingerprint },
          {
            type: NotificationType.NEW_POST,
            id: postEntity.id.toString(),
            fingerprint: user.fingerprint,
          },
        );
      }
    }
  }

  public async fetchPostsFor(fingerprint: string) {
    const posts = await this.postRepo.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint } },
      relations: { decryptionKeys: true, chat: true },
    });
    return this.mapPosts(posts);
  }

  async fetchPosts(fingerprint: string, chatId: number) {
    const posts = await this.postRepo.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint }, chat: { id: chatId } },
      relations: { decryptionKeys: true, chat: true },
    });
    return this.mapPosts(posts);
  }

  private mapPosts(posts: PostEntity[]): Partial<PostEntity>[] {
    return posts
      .filter((post) => !post.days_to_live || post.created_at + 60 * 60 * 1000 * 24 * post.days_to_live > Date.now())
      .map((post) => ({
        ...post,
        file_path: undefined,
        data: this.fileService.retrieve(new FilePointer(post.file_path)),
      }));
  }

  async delete(postId: number, user: UserEntity) {
    await this.decryptionKeyRepo.delete({ message: { id: postId } });
    await this.postRepo.delete({ id: postId, sender_fingerprint: user.fingerprint });
  }

  async like(postId: string, user: UserEntity) {
    const post = await this.postRepo.findOneOrFail({
      where: { id: Number.parseInt(postId) },
      relations: { decryptionKeys: true },
    });
    const canSeePost = post.decryptionKeys.some((recipient) => recipient.recipient_fingerprint == user.fingerprint);
    if (!canSeePost) throw new UnauthorizedException();

    this.notificationService.notify(
      { fingerprint: post.sender_fingerprint },
      {
        fingerprint: user.fingerprint,
        type: NotificationType.LIKE_POST,
        id: postId,
      },
    );
  }
}
