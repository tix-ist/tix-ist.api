import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user with email + password' })
  @ApiStandardResponse(RegisterResponseDto, {
    status: 201,
    description: 'User created',
  })
  @ApiProblemResponse(409, 'Email already registered')
  @ApiProblemResponse(400, 'Validation failed')
  async register(@Body() dto: RegisterDto): Promise<{ user: AuthUser }> {
    return { user: await this.auth.register(dto) };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate and receive access + refresh tokens' })
  @ApiStandardResponse(LoginResponseDto, {
    description: 'Access token, refresh token and user',
  })
  @ApiProblemResponse(401, 'Invalid credentials')
  async login(@Body() dto: LoginDto): Promise<Tokens & { user: AuthUser }> {
    const { tokens, user } = await this.auth.login(dto);
    return { ...tokens, user };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rotate tokens using a refresh token (Authorization: Bearer)',
  })
  @ApiStandardResponse(TokensResponseDto, {
    description: 'A new access + refresh token pair',
  })
  @ApiProblemResponse(401, 'Missing/invalid refresh token')
  refresh(
    @CurrentUser() user: { sub: string; refreshToken: string },
  ): Promise<Tokens> {
    return this.auth.refresh(user.sub, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  @ApiNoContentResponse({ description: 'Logged out' })
  @ApiProblemResponse(401, 'Missing/invalid access token')
  async logout(@CurrentUser() user: AuthUser): Promise<void> {
    await this.auth.logout(user.id);
  }
}
