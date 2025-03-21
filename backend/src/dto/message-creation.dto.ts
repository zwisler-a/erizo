import {ApiProperty} from "@nestjs/swagger";
import {ChallengeRequestDto} from "./challenge-request.dto";

export class RecipientList {
    @ApiProperty()
    fingerprint: string;
    @ApiProperty()
    encryption_key: string;
}

export class MessageCreationDto extends ChallengeRequestDto {
    @ApiProperty()
    data: string;
    @ApiProperty()
    message: string;
    @ApiProperty()
    iv: string;
    @ApiProperty()
    recipients: RecipientList[];
    @ApiProperty()
    sender_fingerprint: string;
    @ApiProperty()
    days_to_live?: number;
}