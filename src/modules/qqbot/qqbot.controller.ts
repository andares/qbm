import { Controller, Get, Post, All, Req, Res, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/core';
import { QqbotService } from './qqbot.service';

@Controller('qqbot')
export class QqbotController {
    constructor(private readonly qqbot: QqbotService) {
        this.qqbot.init();
    }

    @All('check')
    async check( @Req() request): Promise<any> {
        let raw: string = request.query.ports;
        let ports = JSON.parse(raw);
        let res = this.qqbot.lists(ports);
        return res;
    }

    @Get('start')
    async start( @Req() request): Promise<any> {
        let { port } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.start(port);
        return res;
    }

    @Get('kill')
    async kill( @Req() request): Promise<any> {
        let { port } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.kill(port);
        return res;
    }

    @Get('stop')
    async stop( @Req() request): Promise<any> {
        let { port } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.stop(port);
        return res;
    }

    @All('init')
    async init(): Promise<any> {
        let res = await this.qqbot.init();
        return res;
    }

    @All('code')
    code( @Req() request, @Res() response) {
        let { port } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.code(port);
            response.end(res, "binary");
    }

    @Get('say')
    async say( @Req() request): Promise<any> {
        let { port, qq, content } = request.query;
        if (!port) {
            throw new HttpException('Param port is lost', HttpStatus.BAD_REQUEST);
        }
        let res = this.qqbot.say(qq, content, port);
        return res;
    }
}
