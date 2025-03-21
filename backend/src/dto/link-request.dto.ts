import {ApiProperty} from "@nestjs/swagger";
import {ChallengeBodyDto} from "./challenge-body.dto";

export class LinkRequestDto extends ChallengeBodyDto {
    @ApiProperty()
    partner_fingerprint: string;
}