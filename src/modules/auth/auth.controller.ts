import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto, VerifyEmailDto, VerifyTokenDto } from './dto/tokens.dto';
import { ApiKeyAuthGuard } from 'src/common/guards/api-key.guard';

@UseGuards(ApiKeyAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() userBody: CreateUserDto) {
    return this.authService.registerUser(userBody);
  }

  @Post('login')
  signIn(@Body() userCredential: SignInDto) {
    return this.authService.signIn(userCredential);
  }

  @Post('logout')
  logout(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.logout(refreshToken);
  }

  @Post('refresh-token')
  refreshToken(@Body() { token }: RefreshTokenDto) {
    return this.authService.refreshToken(token);
  }

  @Post('send-verification-email')
  sendVerifiedEmail(@Body() { email }: VerifyEmailDto) {
    return this.authService.sendVerifiedEmailForFreeGen(email);
  }

  @Post('verify-email')
  verifyEmail(@Body() { token }: VerifyTokenDto) {
    return this.authService.verifyEmail(token);
  }
}
