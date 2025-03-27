import { ApiProperty } from '@nestjs/swagger';

export class CreateThreadRequest {
  @ApiProperty()
  name: string;
  @ApiProperty()
  participants: string[];
}
