import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceEntity } from './device.entity';

@Entity()
export class UserEntity {
  @ApiProperty()
  @PrimaryColumn()
  fingerprint: string;

  @ApiProperty()
  @Column()
  public_key: string;

  @OneToMany((type) => DeviceEntity, (device) => device.user)
  devices: DeviceEntity[];
}
