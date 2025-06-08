import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';

@Entity()
export class CommentDecryptionKeyEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommentEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  comment: CommentEntity;

  @ApiProperty()
  @Column()
  recipient_fingerprint: string;

  @ApiProperty()
  @Column()
  encrypted_key: string;
}
