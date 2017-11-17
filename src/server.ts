import * as bodyParser from 'body-parser';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';
import { ProtocolInterceptor } from './modules/protocol.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    app.use(bodyParser.json());
    app.useGlobalInterceptors(new ProtocolInterceptor());
    await app.listen(3000);
}
bootstrap();
