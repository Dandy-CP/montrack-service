import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';
import { PocketModule } from './pocket/pocket.module';
import { TransactionModule } from './transaction/transaction.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UploadModule } from './upload/upload.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    WalletModule,
    PocketModule,
    TransactionModule,
    UploadModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
