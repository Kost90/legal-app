import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import PdfModule from '../pdf/pdf.module';
import { Document } from './entities/document.entity';
import { DocumentType } from '../documentType/entities/document-type.entity';
import { DocumentsController } from './documents.controller';
import { DocumentService } from './services/document.service';
import StorageModule from '../storage/storage.module';
import { DocumentGenerationLog } from './entities/document-generation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentType, DocumentGenerationLog]), PdfModule, StorageModule],
  controllers: [DocumentsController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export default class DocumentModule {}
