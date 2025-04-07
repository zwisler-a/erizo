import { ApiProperty } from '@nestjs/swagger';



export class CreatePostResponseDto {
  @ApiProperty()
  post_id: number;
}
