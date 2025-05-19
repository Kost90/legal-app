import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './services/user.service';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';
import { CONTROLLERS } from 'src/common/constants/controllers.enum';
import { getUserDecorator } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(ApiKeyAuthGuard)
@Controller(CONTROLLERS.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserInformation(@getUserDecorator() user: { id: string; email: string }) {
    return this.userService.getUserInformation(user.id);
  }
}
