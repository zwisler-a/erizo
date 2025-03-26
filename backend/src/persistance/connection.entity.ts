import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ChatEntity } from './chat.entity';

@Entity()
export class ConnectionEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'NO ACTION' })
  @JoinColumn()
  owner: UserEntity;

  @ApiProperty()
  @ManyToOne(() => UserEntity, { onDelete: 'NO ACTION' })
  @JoinColumn()
  connectedWith: UserEntity;

  @ApiProperty({ required: false })
  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  chat: ChatEntity;

  @ApiProperty()
  @Column({ default: 'PENDING', enum: ['PENDING', 'CONFIRMED', 'REJECTED'] })
  state: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}
