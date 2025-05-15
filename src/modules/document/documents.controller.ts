import { Body, Controller, Header, Post, UseGuards } from '@nestjs/common';

import { DocumentService } from './services/document.service';
import { CreatePowerOfAttorneyDto } from './dto/create-power-of-attorney.dto';
import { CONTROLLERS } from 'src/common/constants/controllers.enum';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';

@UseGuards(ApiKeyAuthGuard)
@Controller(CONTROLLERS.DOCUMENTS)
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create-power-of-attorney-property')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async createPowerOfAttorneyProperty(@Body() body: CreatePowerOfAttorneyDto) {
    return this.documentService.createPowerOfAttorneyPropertyDocument(body);
  }
}
