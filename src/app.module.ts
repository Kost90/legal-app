import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from './config/configuration';
import typeorm from './config/typeorm.config';
import UserModule from './modules/user/users.module';
import AuthModule from './modules/auth/auth.module';
import StorageModule from './modules/storage/storage.module';
import TemplateModule from './modules/template/template.module';
import PdfModule from './modules/pdf/pdf.module';
import DocumentModule from './modules/document/documents.module';
import { AiModule } from './modules/ai/ai.module';
import { EmailModule } from './modules/email/email.module';
import { EventEmitterModule } from './modules/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [typeorm, configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
    }),
    UserModule,
    AuthModule,
    StorageModule,
    DocumentModule,
    PdfModule,
    TemplateModule,
    AiModule,
    EmailModule,
    EventEmitterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
