import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '../openapi/api-tags';
import {
  ApiProblemResponse,
  ApiStandardResponse,
} from '../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import type { AuthUser, Tokens } from './auth.types';
import {
  LoginResponseDto,
  RegisterResponseDto,
  TokensResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@ApiTags(ApiTag.Auth)
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * Register a new user.
   * @remarks Creates an account from an email + password (the password is bcrypt-hashed).
   * Does not log the user in — call `POST /auth/login` afterwards to obtain tokens.
   */
  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiStandardResponse(RegisterResponseDto, {
    status: 201,
    description: 'User created',
  })
  @ApiProblemResponse(409, 'Email already registered')
  @ApiProblemResponse(400, 'Validation failed')
  async register(@Body() dto: RegisterDto): Promise<{ user: AuthUser }> {
    return { user: await this.auth.register(dto) };
  }

  /**
   * Log in with email and password.
   * @remarks Returns a short-lived access token and a longer-lived refresh token (plus the
   * user). Send the access token as `Authorization: Bearer <accessToken>` on protected routes.
   */
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiStandardResponse(LoginResponseDto, {
    description: 'Access token, refresh token and user',
  })
  @ApiProblemResponse(401, 'Invalid credentials')
  async login(@Body() dto: LoginDto): Promise<Tokens & { user: AuthUser }> {
    const { tokens, user } = await this.auth.login(dto);
    return { ...tokens, user };
  }

  /**
   * Rotate the token pair using a refresh token.
   * @remarks Send the refresh token as `Authorization: Bearer <refreshToken>`. On success the
   * old refresh token is invalidated (rotation) and a fresh access + refresh pair is returned.
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiStandardResponse(TokensResponseDto, {
    description: 'A new access + refresh token pair',
  })
  @ApiProblemResponse(401, 'Missing/invalid refresh token')
  refresh(
    @CurrentUser() user: { sub: string; refreshToken: string },
  ): Promise<Tokens> {
    return this.auth.refresh(user.sub, user.refreshToken);
  }

  /**
   * Log out the current user.
   * @remarks Revokes the stored refresh token so it can no longer be used to mint new
   * access tokens. Requires a valid access token.
   */
  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Logged out' })
  @ApiProblemResponse(401, 'Missing/invalid access token')
  async logout(@CurrentUser() user: AuthUser): Promise<void> {
    await this.auth.logout(user.id);
  }
}
