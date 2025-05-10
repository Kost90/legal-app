import { Module } from '@nestjs/common';

import TemplateModule from '../template/template.module';
import { PdfService } from './pdf.service';

@Module({
  imports: [TemplateModule],
  providers: [PdfService],
  exports: [PdfService],
})
export default class PdfModule {}
