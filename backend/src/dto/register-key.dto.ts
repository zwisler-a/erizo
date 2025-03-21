import {ApiProperty} from "@nestjs/swagger";

export class RegisterKeyDto {
    @ApiProperty()
    fingerprint: string;
    @ApiProperty()
    public_key: string;
}