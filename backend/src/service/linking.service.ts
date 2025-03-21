import {Injectable} from "@nestjs/common";
import {ValidatedChallenge} from "../dto/validated-challenge.dto";
import {LinkRequestDto} from "../dto/link-request.dto";
import {CryptoService} from "./crypto.service";
import {Repository} from "typeorm";
import {IdentityEntity} from "../persistance/identity.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {LinkRequestEntity} from "../persistance/link-request.entity";

@Injectable()
export class LinkingService {

    constructor(
        private cryptoService: CryptoService,
        @InjectRepository(IdentityEntity) private identityRepository: Repository<IdentityEntity>,
        @InjectRepository(LinkRequestEntity) private linkRequestRepository: Repository<LinkRequestEntity>,
    ) {
    }

    async createRequest(request: LinkRequestDto & ValidatedChallenge) {
        if (!request.public_key || !request.partner_fingerprint) {
            throw new Error("Invalid link request");
        }
        const requesterFingerprint = await this.cryptoService.generateHash(request.public_key);
        if (requesterFingerprint == request.partner_fingerprint) throw new Error("Link request failed. Can link yourself");
        const requesterIdentity = await this.identityRepository.findOneOrFail({where: {fingerprint: requesterFingerprint}});
        const requestedIdentity = await this.identityRepository.findOneOrFail({where: {fingerprint: request.partner_fingerprint}});

        const otherPartyRequest = await this.linkRequestRepository.findOne({
            where: {
                requester: requestedIdentity,
                requested: requesterIdentity,
            }
        });
        let confirmed = false;
        if (!!otherPartyRequest) {
            confirmed = true;
            otherPartyRequest.confirmed = true;
            await this.linkRequestRepository.save(otherPartyRequest);
        }

        if (await this.linkRequestRepository.count({
            where: {
                requester: requesterIdentity,
                requested: requestedIdentity,
            }
        }) > 0) {
            throw new Error("Link request failed. Link already exists");
        }

        const linkRequest = this.linkRequestRepository.create({
            requester: requesterIdentity,
            requested: requestedIdentity,
            confirmed: confirmed
        });
        await this.linkRequestRepository.save(linkRequest);
    }

    async getOpenRequests(public_key: string) {
        const fingerprint = await this.cryptoService.generateHash(public_key);
        const requestedIdentity = await this.identityRepository.findOneOrFail({where: {fingerprint: fingerprint}});
        const openRequests = await this.linkRequestRepository.find({
            where: {
                requested: requestedIdentity,
                confirmed: false
            },
            relations: ['requester', 'requested'],
        });
        return openRequests.map(req => ({
            requester: {fingerprint: req.requester.fingerprint},
            requested: {fingerprint: req.requested.fingerprint},
        }));
    }

    async getConfirmedRequests(public_key: string) {
        const fingerprint = await this.cryptoService.generateHash(public_key);
        const requestedIdentity = await this.identityRepository.findOneOrFail({
            where: {fingerprint: fingerprint}
        });
        return await this.linkRequestRepository.find({
            where: {requested: requestedIdentity, confirmed: true},
            relations: ['requester', 'requested']
        });
    }
}
