import {ApiProperty} from "@nestjs/swagger";
import {ChallengeBodyDto} from "../../authentication/dto/challenge-body.dto";

export class ConnectionRequestDto {
    @ApiProperty()
    partner_fingerprint: string;

    @ApiProperty()
    alias: string;
}