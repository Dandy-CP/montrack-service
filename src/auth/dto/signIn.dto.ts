import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignInBodyDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
