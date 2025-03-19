import {Body, Controller, Post} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {IdentityEntity} from "./identity.entity";

type Identity = {
    hash: string;
    public_key: string;
};

@Controller("api")
export class IdentityController {

    constructor(
        @InjectRepository(IdentityEntity) private identityRepository: Repository<IdentityEntity>
    ) {

    }

    @Post('/key-search')
    async searchForKey(@Body() body: any) {
        try {
            const {hash} = body;
            return await this.identityRepository.findOne({where: {hash: hash}}) ?? {};
        } catch (error) {
            return {error: error.message};
        }
    }

    @Post('/register-key')
    async getPublicKeyByHash(@Body() body: { hash: string, public_key: string }) {
        try {
            const {hash, public_key} = body;
            await this.identityRepository.upsert(
                {hash: hash, public_key: public_key},
                ["hash"]
            );

        } catch (error) {
            return {error: error.message};
        }
    }


}
