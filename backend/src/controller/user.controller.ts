import {Body, Controller, HttpException, HttpStatus, Post, UseGuards} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {IdentityEntity} from "../persistance/identity.entity";
import {RegisterKeyDto} from "../dto/register-key.dto";
import {ChallengeValidationGuard} from "../util/challenge-validation.guard";
import {LinkRequestDto} from "../dto/link-request.dto";
import {ValidatedChallenge} from "../dto/validated-challenge.dto";
import {LinkingService} from "../service/linking.service";
import {ChallengeBodyDto} from "../dto/challenge-body.dto";

@Controller("api")
export class UserController {

    constructor(
        private linkingService: LinkingService,
        @InjectRepository(IdentityEntity) private identityRepository: Repository<IdentityEntity>
    ) {

    }

    @Post('/register-key')
    async getPublicKeyByHash(@Body() body: RegisterKeyDto) {
        try {
            const {fingerprint, public_key} = body;
            await this.identityRepository.upsert(
                {fingerprint: fingerprint, public_key: public_key},
                ["fingerprint"]
            );
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/link-request')
    @UseGuards(ChallengeValidationGuard)
    async requestLink(@Body() body: LinkRequestDto) {
        try {
            await this.linkingService.createRequest(body as LinkRequestDto & ValidatedChallenge);
            return {success: true};
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/link-request/open')
    @UseGuards(ChallengeValidationGuard)
    async myOpenLinkRequests(@Body() body: ChallengeBodyDto) {
        try {
            const {public_key} = body as any;
            return this.linkingService.getOpenRequests(public_key);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/link-request/confirmed')
    @UseGuards(ChallengeValidationGuard)
    async myConfirmedLinkRequests(@Body() body: ChallengeBodyDto) {
        try {
            const {public_key} = body as any;
            return this.linkingService.getConfirmedRequests(public_key);
        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
