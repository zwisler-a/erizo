import {Controller, Post, Res} from '@nestjs/common';
import {Response} from "express";

@Controller('log')
export class LoggerController {

    @Post('share')
    handleShare(@Res() res: Response) {
        res.redirect(303, '/share');
    }
}

