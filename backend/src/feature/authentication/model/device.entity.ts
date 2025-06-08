import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class DeviceEntity {
  @PrimaryColumn()
  fcmToken: string;

  @ManyToOne((type) => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
