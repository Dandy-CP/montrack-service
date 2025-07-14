import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AppController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [
    WalletModule,
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
