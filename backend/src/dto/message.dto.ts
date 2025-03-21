import {ApiProperty} from "@nestjs/swagger";

export class MessageDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    sender_fingerprint: string;

    @ApiProperty()
    recipient_fingerprint: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    data: string;

    @ApiProperty()
    encrypted_key: string;

    @ApiProperty()
    iv: string;

    @ApiProperty()
    created_at: number;
}