import {ApiProperty} from "@nestjs/swagger";

export class SetConnectionAliasRequest {
    @ApiProperty()
    id: number;
    @ApiProperty()
    alias: string;
}