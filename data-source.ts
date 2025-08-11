import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XrayData } from './entity/xray-data.entity';
import { Dataset } from './entity/datasets';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        schema: process.env.DB_SCHEMA,
        synchronize: true,
        logging: false,
        entities: [XrayData, Dataset],
        migrations: [],
        subscribers: [],
        ssl: false,
        extra: {
        max: 50, 
        min: 10 
        }
      }),
    }),
  ],
  exports: [TypeOrmModule
  ],
})
export class TypeOrmConfigModule { }
