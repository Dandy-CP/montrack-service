import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  SignUpBodyDTO,
  SignInBodyDTO,
  RefreshTokenBodyDTO,
  VerifyNew2FABodyDTO,
  Validate2FABodyDTO,
  Disable2FABodyDTO,
} from './dto/auth.dto';
import { JWTPayloadUser } from './interface/authResponse.interface';
import { GetUser } from './decorators/user.decorator';
import { NoCache } from '../redis/decorator/no-cache.decorator';

@Controller('auth')
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signin')
  @NoCache()
  SignIn(@Body() payload: SignInBodyDTO) {
    return this.authService.SignIn(payload);
  }

  @Public()
  @Post('/signup')
  @NoCache()
  SignUp(@Body() payload: SignUpBodyDTO) {
    return this.authService.SignUp(payload);
  }

  @Public()
  @Post('/refresh-token')
  @NoCache()
  RefreshToken(@Body() payload: RefreshTokenBodyDTO) {
    return this.authService.refreshToken(payload);
  }

  @Public()
  @Post('/validate-2fa')
  @NoCache()
  Validate2FA(@Body() payload: Validate2FABodyDTO) {
    return this.authService.validate2FA(payload);
  }

  @Post('/enable-2fa')
  @NoCache()
  Enable2FA(@GetUser() user: JWTPayloadUser) {
    return this.authService.enable2FA(user.user_id);
  }

  @Post('/verify-new-2fa')
  @NoCache()
  VerifyNew2FA(
    @Body() payload: VerifyNew2FABodyDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.authService.verifyNew2FA(payload, user.user_id);
  }

  @Post('/disable-2fa')
  @NoCache()
  Disable2FA(
    @Body() payload: Disable2FABodyDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.authService.disable2FA(payload, user.user_id);
  }

  @Get('/logedin-user')
  @NoCache()
  LogedInUser(@GetUser() user: JWTPayloadUser) {
    return this.authService.getLogedUser(user.user_id);
  }

  @Post('/logout')
  @NoCache()
  LogoutUser(@GetUser() user: JWTPayloadUser) {
    return this.authService.logOutUser(user.user_id);
  }

  @Post('/delete-account')
  @NoCache()
  DeleteAccount(@GetUser() user: JWTPayloadUser) {
    return this.authService.deleteAccount(user.user_id);
  }

  @Post('/reset-account')
  @NoCache()
  ResetAccount(@GetUser() user: JWTPayloadUser) {
    return this.authService.resetAccount(user.user_id);
  }
}
