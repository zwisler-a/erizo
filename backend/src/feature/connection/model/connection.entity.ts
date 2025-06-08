import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../authentication/model/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ThreadEntity } from '../../thread/model/thread.entity';

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

  @ApiProperty()
  @Column({ nullable: true })
  alias: string;

  @ApiProperty({ required: false })
  @ManyToOne(() => ThreadEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  thread: ThreadEntity;

  @ApiProperty()
  @Column({ default: 'PENDING', enum: ['PENDING', 'CONFIRMED', 'REJECTED'] })
  state: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}
