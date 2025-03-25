import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  fingerprint: string;
  @ApiProperty()
  public_key: string;
}
