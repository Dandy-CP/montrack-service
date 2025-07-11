import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpBodyDTO } from './dto/SignUp.dto';
import {
  SignInResponse,
  SingUpResponse,
} from './interface/authResponse.interface';
import { SignInBodyDTO } from './dto/signIn.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signin')
  SignIn(@Body() payload: SignInBodyDTO): Promise<SignInResponse> {
    return this.authService.SignIn(payload);
  }

  @Public()
  @Post('/signup')
  SignUp(@Body() payload: SignUpBodyDTO): Promise<SingUpResponse> {
    return this.authService.SignUp(payload);
  }
}
