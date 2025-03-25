import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CryptoService } from './crypto.service';

@Injectable()
export class ChallengeService {
  private logger = new Logger(ChallengeService.name);
  private challenges: Record<string, { claimed_key: string }> = {};

  constructor(private cryptoService: CryptoService) {}

  public createChallenge(claimed_key: string) {
    const token = randomBytes(32).toString('hex');
    const challenge = this.cryptoService.encryptMessage(claimed_key, token);
    this.challenges[token] = { claimed_key };
    return { challenge };
  }

  public validateChallenge(challenge_token: string): string | null {
    if (this.challenges[challenge_token]) {
      const validated_key = this.challenges[challenge_token].claimed_key;
      delete this.challenges[challenge_token];
      return validated_key;
    }
    this.logger.warn('Invalid challenge token');
    return null;
  }
}
