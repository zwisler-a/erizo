import {Controller, Post, Res} from '@nestjs/common';
import {Response} from "express";

@Controller('log')
export class ShareController {

    @Post('share')
    handleShare(@Res() res: Response) {
        res.redirect(303, '/share');
    }
}

