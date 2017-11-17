import { Module } from '@nestjs/common';
import { QqbotModule } from './qqbot/qqbot.module';

@Module({
    modules: [QqbotModule],
})
export class ApplicationModule {}