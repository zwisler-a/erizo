import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DeviceEntity {
  @ApiProperty()
  @PrimaryColumn()
  fcmToken: string;

  @ManyToOne((type) => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
