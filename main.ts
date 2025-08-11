import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as dotenv from 'dotenv';

async function bootstrap() {
    dotenv.config();

    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const options = new DocumentBuilder()
        .setTitle("IOT")
        .setDescription("")
        .setVersion("1.0.0")
        .build();
   const document = SwaggerModule.createDocument(app, options);
   SwaggerModule.setup("", app, document);
    await app.listen(process.env.PORT);
}
bootstrap();
