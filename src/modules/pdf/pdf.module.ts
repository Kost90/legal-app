import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import TemplateModule from '../template/template.module';
import { PdfService } from './pdf.service';
import pdfconfig from './pdf-config';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';

@Module({
  imports: [TemplateModule, ConfigModule.forRoot({ load: [pdfconfig] }), PuppeteerModule],
  providers: [PdfService],
  exports: [PdfService],
})
export default class PdfModule {}
