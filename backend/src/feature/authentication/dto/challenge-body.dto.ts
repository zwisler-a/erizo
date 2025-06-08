import {ApiProperty} from "@nestjs/swagger";

export class ChallengeBodyDto {
    @ApiProperty()
    challenge_token: string;
}