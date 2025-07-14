import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  SignUpBodyDTO,
  SignInBodyDTO,
  RefreshTokenBodyDTO,
} from './dto/auth.dto';
import {
  SignInResponse,
  SingUpResponse,
} from './interface/authResponse.interface';

@Controller('auth')
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signin')
  SignIn(@Body() payload: SignInBodyDTO): Promise<SignInResponse | undefined> {
    return this.authService.SignIn(payload);
  }

  @Public()
  @Post('/signup')
  SignUp(@Body() payload: SignUpBodyDTO): Promise<SingUpResponse> {
    return this.authService.SignUp(payload);
  }

  @Post('/refresh-token')
  RefreshToken(@Body() payload: RefreshTokenBodyDTO) {
    return this.authService.refreshToken(payload);
  }
}
