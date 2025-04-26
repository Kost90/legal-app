import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import typeorm from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [typeorm],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get<TypeOrmModuleOptions>('typeorm'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
