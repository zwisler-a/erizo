import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DecryptionKeyEntity } from './decryption-key.entity';
import { ChatEntity } from './chat.entity';

@Entity()
export class MessageEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  sender_fingerprint: string;

  @ApiProperty({ type: DecryptionKeyEntity, isArray: true })
  @OneToMany(() => DecryptionKeyEntity, (user) => user.message, { cascade: true })
  decryptionKeys: DecryptionKeyEntity[];

  @ApiProperty()
  @ManyToOne(() => ChatEntity, (chat) => chat.messages)
  @JoinColumn()
  chat: ChatEntity;

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
}
