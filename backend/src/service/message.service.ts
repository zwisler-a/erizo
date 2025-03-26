import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from '../persistance/message.entity';
import { Repository } from 'typeorm';
import { FileService } from './file.service';
import { CryptoService } from './crypto.service';
import { MessageCreationDto } from '../dto/message-creation.dto';
import { ChatEntity } from '../persistance/chat.entity';
import { NotificationService } from './notification.service';
import { UserEntity } from '../persistance/user.entity';

@Injectable()
export class MessageService {
  constructor(
    private cryptoService: CryptoService,
    private notificationService: NotificationService,
    @InjectRepository(ChatEntity) private chatRepository: ChatEntity,
    @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
    private fileService: FileService,
  ) {}

  public async create(message: MessageCreationDto, user: UserEntity): Promise<void> {
    const file = this.fileService.store(message.data);
    const messageEntity = this.messageRepository.create({
      decryptionKeys: message.recipients.map((recipient) => ({
        recipient_fingerprint: recipient.fingerprint,
        encrypted_key: recipient.encryption_key,
      })),
      chat: { id: message.chat_id },
      message: message.message,
      iv: message.iv,
      sender_fingerprint: user.fingerprint,
      file_path: file.relativePath,
      days_to_live: message.days_to_live,
    });
    await this.messageRepository.save(messageEntity);
    for (let recipient of message.recipients) {
      if (recipient.fingerprint !== user.fingerprint) {
        await this.notificationService.notify(
          { fingerprint: recipient.fingerprint },
          'You got Mail',
          'There is something waiting for you :)',
          { icon: 'mail', link: '/' },
        );
      }
    }
  }

  public async fetchMessagesForPublicKey(key: string) {
    const fingerprint = await this.cryptoService.generateHash(key);
    return this.fetchMessagesForFingerprint(fingerprint);
  }

  public async fetchMessagesForFingerprint(fingerprint: string) {
    const messages = await this.messageRepository.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint } },
      relations: { decryptionKeys: true, chat: true },
    });
    return messages.filter(
      (msg) => !msg.days_to_live || msg.created_at + 60 * 60 * 1000 * 24 * msg.days_to_live > Date.now(),
    );
  }

  async fetchMessages(fingerprint: string, chatId: number) {
    const messages = await this.messageRepository.find({
      where: { decryptionKeys: { recipient_fingerprint: fingerprint }, chat: { id: chatId } },
      relations: { decryptionKeys: true, chat: true },
    });
    return messages.filter(
      (msg) => !msg.days_to_live || msg.created_at + 60 * 60 * 1000 * 24 * msg.days_to_live > Date.now(),
    );
  }
}
