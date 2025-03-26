import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from './message.entity';

@Entity()
export class ChatEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: true })
  name: string;

  @ApiProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn()
  owner: UserEntity;

  @ManyToMany(() => UserEntity, { onDelete: 'NO ACTION' })
  @JoinTable()
  participants: UserEntity[];

  @OneToMany(() => MessageEntity, (message) => message.chat, { onDelete: 'CASCADE' })
  messages: MessageEntity[];
}
