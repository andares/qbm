import { Module } from '@nestjs/common';
import { QqbotController } from './qqbot.controller';
import { QqbotService } from './qqbot.service';

@Module({
    controllers: [QqbotController],
    components: [QqbotService],
})
export class QqbotModule {}