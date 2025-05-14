import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import TemplateModule from '../template/template.module';
import { PdfService } from './pdf.service';
import pdfconfig from './pdf-config';

@Module({
  imports: [TemplateModule, ConfigModule.forRoot({ load: [pdfconfig] })],
  providers: [PdfService],
  exports: [PdfService],
})
export default class PdfModule {}
