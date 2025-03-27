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
import { PostEntity } from './post.entity';

@Entity({ name: 'chat_entity' })
export class ThreadEntity {
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

  @ApiProperty({ type: UserEntity, isArray: true })
  @ManyToMany(() => UserEntity, { onDelete: 'NO ACTION' })
  @JoinTable()
  participants: UserEntity[];

  @OneToMany(() => PostEntity, (message) => message.chat, { onDelete: 'NO ACTION' })
  messages: PostEntity[];
}
