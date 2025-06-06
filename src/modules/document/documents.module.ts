import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import PdfModule from '../pdf/pdf.module';
import { Document } from './entities/document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentService } from './services/document.service';
import StorageModule from '../storage/storage.module';
import { DocumentGenerationLog } from './entities/document-generation.entity';
import UserModule from '../user/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentGenerationLog]),
    PdfModule,
    StorageModule,
    forwardRef(() => UserModule),
  ],
  controllers: [DocumentsController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export default class DocumentModule {}
