import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from './post.entity';

@Entity()
export class DecryptionKeyEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PostEntity)
  @JoinColumn()
  message: PostEntity;

  @ApiProperty()
  @Column()
  recipient_fingerprint: string;

  @ApiProperty()
  @Column()
  encrypted_key: string;
}
