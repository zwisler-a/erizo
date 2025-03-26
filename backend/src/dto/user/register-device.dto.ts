import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty()
  fcmToken: string;
}
