import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {CryptoService} from './crypto.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MessageEntity} from "./message.entity";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import {IdentityController} from "./indentity.controller";
import {IdentityEntity} from "./identity.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "db",
            synchronize: true,
            entities: [MessageEntity, IdentityEntity],
        }),
        TypeOrmModule.forFeature([MessageEntity, IdentityEntity]),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client')
        }),
    ],
    controllers: [AppController, IdentityController],
    providers: [CryptoService],
})
export class AppModule {
}
