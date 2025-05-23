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

  @ApiProperty({ type: UserEntity })
  @ManyToOne(() => UserEntity, { cascade: false, nullable: true })
  @JoinColumn()
  owner: UserEntity;

  @ApiProperty({ type: UserEntity, isArray: true })
  @ManyToMany(() => UserEntity, { cascade: false })
  @JoinTable()
  participants: UserEntity[];

  @OneToMany(() => PostEntity, (message) => message.chat, { cascade: false })
  messages: PostEntity[];
}
