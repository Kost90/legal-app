import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StorageService } from './storage.service';
import bucket from 'src/modules/storage/bucket';

@Module({
  imports: [ConfigModule.forRoot({ load: [bucket] })],
  providers: [StorageService],
  exports: [StorageService],
})
export default class StorageModule {}
