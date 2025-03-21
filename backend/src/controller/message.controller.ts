import {Body, Controller, HttpException, HttpStatus, Post, UseGuards} from '@nestjs/common';
import {ChallengeValidationGuard} from "../util/challenge-validation.guard";
import {MessageService} from "../service/message.service";
import {MessageCreationDto} from "../dto/message-creation.dto";
import {ApiOkResponse} from "@nestjs/swagger";
import {ChallengeBodyDto} from "../dto/challenge-body.dto";
import {FilePointer, FileService} from "../service/file.service";
import {MessageDto} from "../dto/message.dto";

@Controller("api")
export class MessageController {

    constructor(
        private messageService: MessageService,
        private fileService: FileService,
    ) {
    }


    @Post('/messages')
    @ApiOkResponse({
        type: MessageDto,
        isArray: true,
    })
    @UseGuards(ChallengeValidationGuard)
    async getMessages(@Body() body: ChallengeBodyDto) {
        try {
            const {public_key} = body as any;
            const messages = await this.messageService.fetchMessagesForPublicKey(public_key);
            return messages.map(message => ({
                ...message,
                file_path: undefined,
                data: this.fileService.retrieve(new FilePointer(message.file_path)),
            }));
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/upload')
    @UseGuards(ChallengeValidationGuard)
    async upload(@Body() body: MessageCreationDto) {
        try {
            body.sender_fingerprint = (body as any).fingerprint;
            await this.messageService.create(body);
        } catch (error) {
            return {error: error.message};
        }
    }
}
