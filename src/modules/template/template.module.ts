import { Module } from '@nestjs/common';

import { TemplateService } from './template.service';
import { AuthorityList } from './entity/authorityList.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import templateConfig from './template-config';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorityList]), ConfigModule.forRoot({ load: [templateConfig] })],
  providers: [TemplateService],
  exports: [TemplateService],
})
export default class TemplateModule {}
