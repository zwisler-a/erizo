import {ApiProperty} from "@nestjs/swagger";

export class ChallengeRequestDto {
    @ApiProperty()
    claimed_key: string;
}