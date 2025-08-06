import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PostDecryptionKeyEntity } from './post-decryption-key.entity';
import { ThreadEntity } from './thread.entity';
import { LikeEntity } from './like.entity';
import { CommentEntity } from './comment.entity';

@Entity()
export class PostEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  sender_fingerprint: string;

  @ApiProperty({ enum: ['image', 'video'] })
  @Column({ default: 'image' })
  type: 'image' | 'video';

  @ApiProperty({ type: PostDecryptionKeyEntity, isArray: true })
  @OneToMany(() => PostDecryptionKeyEntity, (user) => user.post, { cascade: true, onDelete: 'CASCADE' })
  decryptionKeys: PostDecryptionKeyEntity[];

  @ApiProperty()
  @ManyToOne(() => ThreadEntity, (thread) => thread.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  thread: ThreadEntity;

  @ApiProperty()
  @Column()
  message: string;

  @Column()
  file_path: string;

  @ApiProperty()
  @Column()
  iv: string;

  @ApiProperty()
  @Column({ default: () => new Date().getTime() })
  created_at: number;

  @ApiProperty()
  @Column({ nullable: true })
  days_to_live: number;

  @ApiProperty()
  @Column({ default: false })
  nsfw: boolean;

  @ApiProperty({ type: LikeEntity, isArray: true })
  @OneToMany(() => LikeEntity, (like) => like.post, { cascade: false })
  likes: LikeEntity[];

  @ApiProperty({ type: CommentEntity, isArray: true })
  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
