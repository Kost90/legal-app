import { Body, Controller, Delete, Get, Header, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './services/user.service';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';
import { CONTROLLERS } from 'src/common/constants/controllers.enum';
import { getUserDecorator } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePowerOfAttorneyDto } from '../document/dto/create-power-of-attorney.dto';
import { DocumentService } from '../document/services/document.service';
import { GetDocumentRequestDto } from '../document/dto/get-documents.dto';

// @UseGuards(ApiKeyAuthGuard)
// @UseGuards(JwtAuthGuard)
@Controller(CONTROLLERS.USER)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUser(@getUserDecorator() user: { id: string; email: string }) {
    return this.userService.getUserInformation(user.id);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('me/:userId')
  getUserInformation(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.userService.getUserInformation(userId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Post('create-power-of-attorney/:userId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async createPowerOfAttorney(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: CreatePowerOfAttorneyDto,
  ) {
    return this.documentService.createPowerOfAttorneyDocument(body, userId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('user-documents/:userId')
  getUserDocuments(@Param('userId', new ParseUUIDPipe()) userId: string, @Query() query: GetDocumentRequestDto) {
    return this.documentService.getUserDocumentsByType(userId, query.documentType, query.documentLang);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('download-user-document/user/:userId/document/:documentId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=generatedPowerOfAttorney.pdf')
  // TODO: поменять на только свой домен
  @Header('Content-Security-Policy', 'frame-ancestors *')
  async downloadDocument(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentService.downloadUserDocument(documentId, userId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('download-user-presigned-document/user/:userId/document/:documentId')
  async downloadDocumentPresigned(
    @Param('documentId') documentId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return await this.documentService.getDocumentPresignedUrl(documentId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-document/:documentId')
  async deleteDocument(@Param('documentId') documentId: string, @getUserDecorator() user: { id: string }) {
    return await this.documentService.removeDocument(documentId, user.id);
  }
}
