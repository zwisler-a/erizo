import {Body, Controller, Post} from '@nestjs/common';
import {ChallengeService} from "../service/challenge.service";
import {ChallengeRequestDto} from "../dto/challenge-request.dto";
import {ApiOkResponse, ApiProperty} from "@nestjs/swagger";

class ChallengeResponse {
    @ApiProperty()
    challenge: string;
}

@Controller("api")
export class ChallengesController {

    constructor(
        private challengeService: ChallengeService,
    ) {

    }

    @Post('/challenge')
    @ApiOkResponse({
        type: ChallengeResponse
    })
    async getChallenge(@Body() body: ChallengeRequestDto) {
        const {claimed_key} = body;
        return this.challengeService.createChallenge(claimed_key);
    }

}
