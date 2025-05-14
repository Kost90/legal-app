import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import aiConfig from './ai-config';
import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [aiConfig] })],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
