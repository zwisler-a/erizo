import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../persistance/post.entity';
import { In, Repository } from 'typeorm';
import { FilePointer, FileService } from './file.service';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { NotificationService, NotificationType } from './notification.service';
import { UserEntity } from '../persistance/user.entity';
import { DecryptionKeyEntity } from '../persistance/decryption-key.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PostService {
  private logger: Logger = new Logger(PostService.name);

  constructor(
    private notificationService: NotificationService,
    @InjectRepository(PostEntity) private postRepo: Repository<PostEntity>,
    @InjectRepository(DecryptionKeyEntity) private decryptionKeyRepo: Repository<DecryptionKeyEntity>,
    private fileService: FileService,
  ) {}

  @Cron('0 0 * * * *')
  async handleCron() {
    this.logger.debug('Cleaning temporary images ...');

    const now = Date.now();
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .where('post.days_to_live IS NOT NULL')
      .andWhere('(post.created_at + post.days_to_live * 86400000) < :now', { now })
      .getMany();
    const promises = posts.map((post: PostEntity) => this.delete(post.id, { fingerprint: post.sender_fingerprint }));
    await Promise.all(promises);
    this.logger.debug(`Cleaned up ${posts.length} posts!`);
  }

  public async create(post: CreatePostDto, user: UserEntity): Promise<PostEntity> {
    const file = this.fileService.store(post.data);
    const postEntity = this.postRepo.create({
      decryptionKeys: post.recipients.map((recipient) => ({
        recipient_fingerprint: recipient.fingerprint,
        encrypted_key: recipient.encryption_key,
      })),
      thread: { id: post.thread_id },
      message: post.message,
      iv: post.iv,
      sender_fingerprint: user.fingerprint,
      file_path: file.relativePath,
      days_to_live: post.days_to_live,
      nsfw: post.nsfw ?? false,
    });
    const savedEntity = await this.postRepo.save(postEntity);
    for (let recipient of post.recipients) {
      if (recipient.fingerprint !== user.fingerprint) {
        await this.notificationService.notify(
          { fingerprint: recipient.fingerprint },
          {
            type: NotificationType.NEW_POST,
            post_id: postEntity.id.toString(),
            fingerprint: user.fingerprint,
          },
        );
      }
    }
    return savedEntity;
  }

  public async fetchPostIdsFor(fingerprint: string, page: number, limit: number) {
    const posts = await this.postRepo.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint } },
      skip: page * limit,
      take: limit,
      order: { id: 'DESC' },
      relations: { decryptionKeys: true, thread: true },
    });
    return this.mapToIds(posts);
  }

  public async fetchPosts(fingerprint: string, ids: number[]) {
    const posts = await this.postRepo.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint }, id: In(ids) },
      relations: { decryptionKeys: true, thread: true, likes: true },
    });
    return this.mapPosts(posts);
  }

  async fetchPostIds(fingerprint: string, threadId: number, page: number, limit: number) {
    const posts = await this.postRepo.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint }, thread: { id: threadId } },
      relations: { decryptionKeys: true, thread: true },
      skip: page * limit,
      take: limit == -1 ? undefined : limit,
      order: { id: 'DESC' },
    });
    return this.mapToIds(posts);
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

  private mapToIds(posts: PostEntity[]): number[] {
    return posts
      .filter((post) => !post.days_to_live || post.created_at + 60 * 60 * 1000 * 24 * post.days_to_live > Date.now())
      .map((post) => post.id);
  }

  async delete(postId: number, user: Partial<UserEntity>) {
    const post = await this.postRepo.findOneOrFail({ where: { id: postId } });
    await this.decryptionKeyRepo.delete({ message: { id: postId } });
    await this.postRepo.delete({ id: postId, sender_fingerprint: user.fingerprint });
    this.fileService.delete(new FilePointer(post.file_path));
  }


}
