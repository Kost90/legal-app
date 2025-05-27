import { Body, Controller, Delete, Get, Header, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './services/user.service';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';
import { CONTROLLERS } from 'src/common/constants/controllers.enum';
import { getUserDecorator } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePowerOfAttorneyDto } from '../document/dto/create-power-of-attorney.dto';
import { DocumentService } from '../document/services/document.service';
import { GetDocumentRequestDto } from '../document/dto/get-documents.dto';

@UseGuards(ApiKeyAuthGuard)
@UseGuards(JwtAuthGuard)
@Controller(CONTROLLERS.USER)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {}

  @Get('me')
  getUserInformation(@getUserDecorator() user: { id: string; email: string }) {
    return this.userService.getUserInformation(user.id);
  }

  @Post('create-power-of-attorney')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async createPowerOfAttorney(
    @getUserDecorator() user: { id: string; email: string },
    @Body() body: CreatePowerOfAttorneyDto,
  ) {
    return this.documentService.createPowerOfAttorneyDocument(body, user.id);
  }

  @Get('user-documents')
  getUserDocuments(@getUserDecorator() user: { id: string; email: string }, @Query() query: GetDocumentRequestDto) {
    return this.documentService.getUserDocumentsByType(user.id, query.documentType, query.documentLang);
  }

  @Get('download-user-document/:documentId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async downloadDocument(
    @getUserDecorator() user: { id: string; email: string },
    @Param('documentId') documentId: string,
  ) {
    return this.documentService.downloadUserDocument(documentId, user.id);
  }

  @Get('download-user-presigned-document/:documentId')
  async downloadDocumentPresigned(@Param('documentId') documentId: string, @getUserDecorator() user: { id: string }) {
    return await this.documentService.getDocumentPresignedUrl(documentId, user.id);
  }

  @Delete('delete-document/:documentId')
  async deleteDocument(@Param('documentId') documentId: string, @getUserDecorator() user: { id: string }) {
    return await this.documentService.removeDocument(documentId, user.id);
  }
}
