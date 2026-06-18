import { UserResponseDto } from './user-response.dto';

export class TokensResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserResponseDto;
}

export class RegisterResponseDto {
  user!: UserResponseDto;
}
