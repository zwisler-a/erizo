import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../authentication/model/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from './post.entity';
import { CommentDecryptionKeyEntity } from './comment-decryption-key.entity';

@Entity()
export class CommentEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  content: string;

  @ApiProperty()
  @Column()
  iv: string;

  @ApiProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  author: UserEntity;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: PostEntity;

  @ApiProperty({ type: CommentDecryptionKeyEntity, isArray: true })
  @OneToMany(() => CommentDecryptionKeyEntity, (key) => key.comment, { cascade: true, onDelete: 'CASCADE' })
  decryptionKeys: CommentDecryptionKeyEntity[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
