import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

import { TemplateService } from '../template/template.service';

@Injectable()
export class PdfService {
  constructor(private readonly templateService: TemplateService) {}

  async generatePdf(templateName: string, data: Record<string, any>): Promise<Buffer> {
    const html = this.templateService.renderTemplate(templateName, data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    const compressedPdf = await this.compressPdf(Buffer.from(buffer));

    return compressedPdf;
  }

  private async compressPdf(buffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer);
    const compressed = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(compressed);
  }
}
