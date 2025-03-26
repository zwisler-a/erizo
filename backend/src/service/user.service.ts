import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CryptoService } from './crypto.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../persistance/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { DeviceEntity } from '../persistance/device.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(DeviceEntity) private deviceRepo: Repository<DeviceEntity>,
    private challengeService: ChallengeService,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
  ) {}

  async signIn(token: string): Promise<{ access_token: string }> {
    const validatedKey = this.challengeService.validateChallenge(token);
    if (!validatedKey) throw new HttpException('Invalid Challenge', HttpStatus.UNAUTHORIZED);

    const fingerprint = await this.cryptoService.generateHash(validatedKey);
    const user = await this.userRepo.findOneOrFail({ where: { fingerprint: fingerprint } });
    const payload: JwtPayloadDto = { fingerprint: user.fingerprint, public_key: user.public_key };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getUserOrFail(fingerprint: string) {
    return this.userRepo.findOneOrFail({ where: { fingerprint } });
  }

  async getUserOrFailByKey(public_key: string) {
    return this.userRepo.findOneOrFail({ where: { public_key: public_key } });
  }

  async registerDevice(user: UserEntity, fcmToken: string) {
    const existing = await this.deviceRepo.exists({
      where: { user: user, fcmToken: fcmToken },
      relations: { user: true },
    });
    if (existing) return false;

    const device = this.deviceRepo.create({
      fcmToken: fcmToken,
      user: user,
    });
    await this.deviceRepo.save(device);
    return true;
  }
}
