import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { HttpModule } from "@nestjs/axios";
import { TerminusModule } from "@nestjs/terminus";
import { APP_FILTER } from '@nestjs/core';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { TypeOrmConfigModule } from './data-source'
import { IotModule } from './search/Iot.module';

import { RabbitMQModule } from './rabbitmq.module';


@Module({
  imports: [
    TypeOrmConfigModule,

    TerminusModule,
    HttpModule,
    IotModule,
RabbitMQModule,
      

  ],
  controllers: [AppController],
  providers: [AppService,

  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}
