import { ApiProperty } from '@nestjs/swagger';

export class IdsPage {
  constructor(page: number, limit: number, data: number[]) {
    this.page = page;
    this.limit = limit;
    this.data = data;
  }

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({type: Number, isArray: true})
  data: number[];
}
