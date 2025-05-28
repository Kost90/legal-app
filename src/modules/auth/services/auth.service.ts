import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { SuccessResponseDTO } from 'src/common/dto/succsess-response.dto';
import { AlreadyExistsException } from 'src/common/exceptions/common.exception';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { EmailService } from 'src/modules/email/email.service';
import { SignInDto } from '../dto/sign-in.dto';
import { TokensDto } from '../dto/tokens.dto';
import { DocumentGenerationLog } from 'src/modules/document/entities/document-generation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(DocumentGenerationLog)
    private documentGenerationLogRepo: Repository<DocumentGenerationLog>,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<SuccessResponseDTO<Omit<User, 'passwordHash'>>> {
    const user = await this.userService.getUserByEmail(createUserDto.email);

    if (user) {
      throw new AlreadyExistsException('User already exist');
    }

    const passwordHashed = await this.hashPassword(createUserDto.password);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...createUser } = createUserDto;

    const createdUser = await this.userService.createUser(passwordHashed, createUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...createdUserWithouPass } = createdUser;

    this.logger.log(`User with ${createdUser.email} registered successfully`);
    const { message } = await this.sendVerifiedEmail(createdUser.email);
    return { data: createdUserWithouPass, statusCode: HttpStatus.OK, message: message };
  }

  public async signIn(userCredentials: SignInDto): Promise<SuccessResponseDTO<TokensDto>> {
    const user = await this.validateUser(userCredentials);

    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email is not verified');
    }

    const tokens = await this.generateTokens(user);

    return {
      data: tokens,
      message: 'Login is successfull',
      statusCode: HttpStatus.OK,
    };
  }

  public async refreshToken(body: string) {
    const payload = this.jwtService.verify<{ id: string; email: string }>(body, {
      secret: this.configService.get('jwtRefreshSecret'),
    });

    const user = await this.userService.getUserByEmail(payload.email);

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const data = await this.generateTokens(user);

    return {
      data,
      message: 'Tokens refreshed',
    };
  }

  private async validateUser(userCredentials: SignInDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userService.getUserByEmail(userCredentials.email);

    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }

    const { passwordHash } = await this.userService.getUserPassword(user.id);

    const comparePassword = await this.comparePassword(userCredentials.password, passwordHash);

    if (!comparePassword) {
      return null;
    }

    return user;
  }

  private async generateTokens(user: Omit<User, 'passwordHash'>): Promise<TokensDto> {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken, actionToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwtSecret'),
        expiresIn: this.configService.get('jwtExpiration'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwtRefreshSecret'),
        expiresIn: this.configService.get('jwtRefreshExpiration'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwtActionSecret'),
        expiresIn: this.configService.get('jwtExpiration'),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
      actionToken,
    };
  }

  public async sendVerifiedEmailForFreeGen(email: string): Promise<{ message: string }> {
    const isExistLog = await this.documentGenerationLogRepo.findOne({ where: { email: email } });

    if (isExistLog && isExistLog.isVerified) {
      throw new BadRequestException('Email already is verified.');
    }

    if (isExistLog && !isExistLog.isVerified) {
      const actionToken = await this.generateVerificationToken(email);
      await this.emailService.sendVerificationEmail(email, actionToken);
      return { message: 'Please verify your email.' };
    }

    const actionToken = await this.generateVerificationToken(email);
    await this.emailService.sendVerificationEmail(email, actionToken);
    await this.documentGenerationLogRepo.save({
      email: email,
      lastFreeGenerationAt: null,
      isVerified: false,
    });
    return { message: 'Please verify your email.' };
  }

  public async logout(refreshToken: string): Promise<SuccessResponseDTO<null>> {
    try {
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwtRefreshSecret'),
      });
      return {
        data: null,
        statusCode: HttpStatus.OK,
        message: 'Logout successful',
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Malformed token. Ensure it is correctly formatted.');
      }
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token format or signature.');
      }
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token has expired. Please request a new one.');
      }
    }
  }

  private async sendVerifiedEmail(email: string): Promise<{ message: string }> {
    const user = await this.userService.getUserByEmail(email);

    if (user && user.isEmailVerified) {
      throw new BadRequestException('Email already is verified.');
    }

    if (user && !user.isEmailVerified) {
      const actionToken = await this.generateVerificationToken(email);
      await this.emailService.sendVerificationEmail(email, actionToken);
      return { message: 'Please verify your email.' };
    }

    const actionToken = await this.generateVerificationToken(email);
    await this.emailService.sendVerificationEmail(email, actionToken);
    return { message: 'Please verify your email.' };
  }

  async verifyEmail(actionToken: string): Promise<{
    message: string;
  }> {
    try {
      if (!actionToken || typeof actionToken !== 'string') {
        throw new BadRequestException('Token must be a valid string.');
      }

      const payload: { email: string } = await this.jwtService.verifyAsync(actionToken, {
        secret: this.configService.get('jwtActionSecret'),
      });

      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid or expired verification token.');
      }

      await this.documentGenerationLogRepo.update(
        { email: payload.email },
        {
          isVerified: true,
        },
      );

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Malformed token. Ensure it is correctly formatted.');
      }
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token format or signature.');
      }
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token has expired. Please request a new one.');
      }
      throw new InternalServerErrorException('Something went wrong during verification.');
    }
  }

  private async hashPassword(pass: string): Promise<string> {
    const password = await bcrypt.hash(pass, Number(this.configService.get('BCRYPT_SALT')));
    return password;
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  private async generateVerificationToken(email: string): Promise<string> {
    return this.jwtService.signAsync(
      { email: email },
      {
        secret: this.configService.get('jwtActionSecret'),
        expiresIn: this.configService.get('jwtExpiration'),
      },
    );
  }
}
