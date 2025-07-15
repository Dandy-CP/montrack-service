import {
  IsNotEmpty,
  IsEmail,
  IsJWT,
  IsString,
  IsBase32,
} from 'class-validator';

export class SignInBodyDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SignUpBodyDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RefreshTokenBodyDTO {
  @IsNotEmpty()
  @IsJWT()
  refresh_token: string;
}

export class VerifyNew2FABodyDTO {
  @IsNotEmpty()
  @IsString()
  token_pin: string;

  @IsNotEmpty()
  @IsString()
  @IsBase32()
  totp_secret: string;
}

export class Validate2FABodyDTO {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  token_pin: string;
}

export class Disable2FABodyDTO {
  @IsNotEmpty()
  @IsString()
  token_pin: string;
}
