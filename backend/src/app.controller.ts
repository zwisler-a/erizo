import {Body, Controller, Post} from '@nestjs/common';
import * as crypto from 'crypto';
import {CryptoService} from "./crypto.service";
import {InjectRepository} from "@nestjs/typeorm";
import {MessageEntity} from "./message.entity";
import {Repository} from "typeorm";

type Message = {
    encrypted_data: string;
    recipient_key: string;
    recipient_public_key: string;
    sender_public_key: string;
    sender_key: string;
    iv: string;
    created_at: string;
};
const challenges: Record<string, { claimed_key: string }> = {};

@Controller("api")
export class AppController {

    constructor(
        private cryptoService: CryptoService,
        @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>
    ) {

    }

    @Post('/upload')
    async upload(@Body() body: Message) {
        try {
            const message = this.messageRepository.create({
                encrypted_data: body.encrypted_data,
                recipient_public_key: body.recipient_public_key,
                recipient_key: body.recipient_key,
                sender_public_key: body.sender_public_key,
                sender_key: body.sender_key,
                iv: body.iv,
                created_at: new Date().getTime()
            });
            await this.messageRepository.save(message);
            return {success: true};
        } catch (error) {
            return {error: error.message};
        }
    }

    @Post('/challenge')
    async getChallenge(@Body() body: any) {
        const {claimed_key} = body;
        const token = crypto.randomBytes(32).toString('hex');
        const challenge = this.cryptoService.encryptMessage(claimed_key, token);
        challenges[token] = {claimed_key};
        return {challenge};
    }

    @Post('/messages')
    async getMessages(@Body() body: any) {
        try {
            const {challenge_token} = body;
            if (challenges[challenge_token]) {
                const validated_key = challenges[challenge_token].claimed_key;
                delete challenges[challenge_token];
                return {
                    received: await this.messageRepository.find({where: {recipient_public_key: validated_key}}) ?? [],
                    send: await this.messageRepository.find({where: {sender_public_key: validated_key}}) ?? []
                };
            } else {
                console.log('Invalid signature');
                return {};
            }
        } catch (error) {
            return {error: error.message};
        }
    }
}
