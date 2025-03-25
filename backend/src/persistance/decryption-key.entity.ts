import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from './message.entity';

@Entity()
export class DecryptionKeyEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MessageEntity)
  @JoinColumn()
  message: MessageEntity;

  @ApiProperty()
  @Column()
  recipient_fingerprint: string;

  @ApiProperty()
  @Column()
  encrypted_key: string;
}
