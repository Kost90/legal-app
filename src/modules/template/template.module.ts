import { Module } from '@nestjs/common';

import { TemplateService } from './template.service';
import { AuthorityList } from './entity/authorityList.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import templateConfig from './template-config';
import { EventEmitterModule } from '../event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorityList]),
    ConfigModule.forRoot({ load: [templateConfig] }),
    AiModule,
    EventEmitterModule,
  ],
  providers: [TemplateService],
  exports: [TemplateService],
})
export default class TemplateModule {}
