import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AppController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { TotpModule } from '../totp/totp.module';
import { TotpService } from '../totp/totp.service';

@Module({
  imports: [
    WalletModule,
    TotpModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRED,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    WalletService,
    TotpService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
