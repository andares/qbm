import { Controller, Get, Post, All, Req, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/core';
import { QqbotService } from './qqbot.service';
import { AddDto } from './dto/add.dto';

@Controller('qqbot')
export class QqbotController {
    constructor(private readonly qqbot: QqbotService) {
        this.qqbot.init();
    }

    @All('check')
    async check( @Req() request): Promise<any> {
        let res = this.qqbot.lists();
        return res;
    }

    @Get('start')
    async start( @Req() request): Promise<any> {
        let { port } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.start(port);
        return [res, 22, request.query];
    }

    @Get('stop')
    async stop( @Req() request): Promise<any> {
        let { port } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.stop(port);
        return [res, 22, request.query];
    }

    @All('init')
    async init(): Promise<any> {
        let res = await this.qqbot.init();
        return res;
    }
}
