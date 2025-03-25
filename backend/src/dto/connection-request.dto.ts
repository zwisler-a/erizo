import {ApiProperty} from "@nestjs/swagger";
import {ChallengeBodyDto} from "./challenge/challenge-body.dto";

export class ConnectionRequestDto {
    @ApiProperty()
    partner_fingerprint: string;
}