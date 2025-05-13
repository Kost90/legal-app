import { Body, Controller, Header, Post } from '@nestjs/common';
import { DocumentService } from './services/document.service';
import { CreatePowerOfAttorneyDto } from './dto/create-power-of-attorney.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create-power-of-attorney-property')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async createPowerOfAttorneyProperty(@Body() body: CreatePowerOfAttorneyDto) {
    return this.documentService.createPowerOfAttorneyPropertyDocument(body);
  }
}
