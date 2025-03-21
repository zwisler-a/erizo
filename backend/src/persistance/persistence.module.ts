import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MessageEntity} from "./message.entity";
import {IdentityEntity} from "./identity.entity";
import {LinkRequestEntity} from "./link-request.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([MessageEntity, IdentityEntity, LinkRequestEntity]),
    ],
    controllers: [],
    providers: [],
    exports: [TypeOrmModule.forFeature([MessageEntity, IdentityEntity, LinkRequestEntity])],
})
export class PersistenceModule {
}
