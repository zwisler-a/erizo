import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {CryptoService} from './service/crypto.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MessageEntity} from "./persistance/message.entity";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from 'path';
import {UserController} from "./controller/user.controller";
import {IdentityEntity} from "./persistance/identity.entity";
import {PersistenceModule} from "./persistance/persistence.module";
import {MessageController} from "./controller/message.controller";
import {ChallengeValidationGuard} from "./util/challenge-validation.guard";
import {ChallengeService} from "./service/challenge.service";
import {ChallengesController} from "./controller/challenge.controller";
import {MessageService} from "./service/message.service";
import {FileService} from "./service/file.service";
import {LinkingService} from "./service/linking.service";
import {LinkRequestEntity} from "./persistance/link-request.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "db.sql",
            synchronize: true,
            entities: [MessageEntity, IdentityEntity, LinkRequestEntity],
        }),
        PersistenceModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client')
        }),
    ],
    controllers: [
        AppController,
        UserController,
        MessageController,
        ChallengesController
    ],
    providers: [
        CryptoService,
        LinkingService,
        ChallengeService,
        MessageService,
        FileService,
        ChallengeValidationGuard
    ],
})
export class AppModule {
}
