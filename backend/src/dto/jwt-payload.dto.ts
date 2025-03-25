import { ApiProperty } from '@nestjs/swagger';

export class JwtPayloadDto {
  @ApiProperty()
  fingerprint: string;
  @ApiProperty()
  public_key: string;
}
