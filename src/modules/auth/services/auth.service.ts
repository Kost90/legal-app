import { BadRequestException, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { SuccessResponseDTO } from 'src/common/dto/succsess-response.dto';
import { AlreadyExistsException } from 'src/common/exceptions/common.exception';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { User } from 'src/modules/users/entity/user.entity';
import { UserService } from 'src/modules/users/services/user.service';
import { SignInDto } from '../dto/sign-in.dto';
import { TokensDto } from '../dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
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

    return { data: createdUserWithouPass, statusCode: HttpStatus.OK, message: 'User registered successfully' };
  }

  public async signIn(userCredentials: SignInDto): Promise<SuccessResponseDTO<TokensDto>> {
    const user = await this.validateUser(userCredentials);

    if (!user) {
      throw new BadRequestException('Wrong email or password');
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
      secret: this.configService.get('JWT_REFRESH_SECRET'),
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
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACTION_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
      actionToken,
    };
  }

  private async hashPassword(pass: string): Promise<string> {
    const password = await bcrypt.hash(pass, Number(this.configService.get('BCRYPT_SALT')));
    return password;
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
