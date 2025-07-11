import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignUpBodyDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
