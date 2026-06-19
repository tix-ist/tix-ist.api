import { UserResponseDto } from './user-response.dto';

export class TokensResponseDto {
  /** Short-lived JWT access token; send as `Authorization: Bearer <accessToken>`. */
  accessToken!: string;

  /** Longer-lived JWT refresh token; exchange it at `POST /auth/refresh`. */
  refreshToken!: string;
}

export class LoginResponseDto {
  /** Short-lived JWT access token. */
  accessToken!: string;

  /** Longer-lived JWT refresh token. */
  refreshToken!: string;

  /** The authenticated user. */
  user!: UserResponseDto;
}

export class RegisterResponseDto {
  /** The newly created user. */
  user!: UserResponseDto;
}
