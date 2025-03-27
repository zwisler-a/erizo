import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DecryptionKeyEntity } from './decryption-key.entity';
import { ThreadEntity } from './thread.entity';

@Entity({ name: 'message_entity' })
export class PostEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  sender_fingerprint: string;

  @ApiProperty({ type: DecryptionKeyEntity, isArray: true })
  @OneToMany(() => DecryptionKeyEntity, (user) => user.message, { cascade: true, onDelete: 'CASCADE' })
  decryptionKeys: DecryptionKeyEntity[];

  @ApiProperty()
  @ManyToOne(() => ThreadEntity, (chat) => chat.messages, {onDelete: 'NO ACTION' })
  @JoinColumn()
  chat: ThreadEntity;

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
}
