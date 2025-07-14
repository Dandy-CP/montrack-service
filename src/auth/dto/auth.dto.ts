import { IsNotEmpty, IsEmail, IsJWT } from 'class-validator';

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
