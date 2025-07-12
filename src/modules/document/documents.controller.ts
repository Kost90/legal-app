import { Body, Controller, Header, Post, UseGuards } from '@nestjs/common';

import { DocumentService } from './services/document.service';
import { CONTROLLERS } from 'src/common/constants/controllers.enum';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';
import { DocumentDiscriminatorPipe } from 'src/common/utilities/documents-discriminator-pipe';
import { CreateDocumentDto } from './dto/create-document.dto';

@UseGuards(ApiKeyAuthGuard)
@Controller(CONTROLLERS.DOCUMENTS)
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create-power-of-attorney-property')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async createPowerOfAttorney(@Body(DocumentDiscriminatorPipe) body: CreateDocumentDto) {
    return this.documentService.createDocument(body);
  }
}
