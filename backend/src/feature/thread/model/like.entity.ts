import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PostDecryptionKeyEntity } from './post-decryption-key.entity';
import { ThreadEntity } from './thread.entity';
import { UserEntity } from '../../authentication/model/user.entity';
import { PostEntity } from './post.entity';

@Entity()
export class LikeEntity {
  @ApiProperty()
  @PrimaryColumn()
  userFingerprint: string;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  post: PostEntity;
}
