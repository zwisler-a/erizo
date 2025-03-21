import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {MessageEntity} from "../persistance/message.entity";
import {Repository} from "typeorm";
import {FileService} from "./file.service";
import {CryptoService} from "./crypto.service";
import {MessageCreationDto} from "../dto/message-creation.dto";

@Injectable()
export class MessageService {

    constructor(
        private cryptoService: CryptoService,
        @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
        private fileService: FileService,
    ) {
    }


    public async create(message: MessageCreationDto): Promise<void> {
        const file = this.fileService.store(message.data);
        for (const recipient of message.recipients) {
            const messageEntity = this.messageRepository.create({
                encrypted_key: recipient.encryption_key,
                recipient_fingerprint: recipient.fingerprint,
                message: message.message,
                iv: message.iv,
                sender_fingerprint: message.sender_fingerprint,
                file_path: file.relativePath,
                days_to_live: message.days_to_live
            });
            await this.messageRepository.save(messageEntity);
        }
    }

    public async fetchMessagesForPublicKey(key: string) {
        const fingerprint = await this.cryptoService.generateHash(key);
        return this.fetchMessagesForFingerprint(fingerprint);
    }

    public async fetchMessagesForFingerprint(fingerprint: string) {
        const messages = await this.messageRepository.find({where: {recipient_fingerprint: fingerprint}})
        return messages.filter(msg => !msg.days_to_live || ((msg.created_at + (60 * 60 * 1000 * 24 * msg.days_to_live)) > Date.now()))
    }

}
