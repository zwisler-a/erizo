import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class UserEntity {
  @ApiProperty()
  @PrimaryColumn()
  fingerprint: string;

  @ApiProperty()
  @Column()
  public_key: string;
}
