import {Injectable, CanActivate, ExecutionContext, BadRequestException} from '@nestjs/common';
import {ChallengeService} from "../service/challenge.service";
import {CryptoService} from "../service/crypto.service";

@Injectable()
export class ChallengeValidationGuard implements CanActivate {

    constructor(private challengeService: ChallengeService, private cryptoService: CryptoService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const {challenge_token} = request.body;

        const key = this.challengeService.validateChallenge(challenge_token);
        if (!key) return false;
        request.body["public_key"] = key;
        request.body["fingerprint"] = await this.cryptoService.generateHash(key);
        return true;
    }
}
