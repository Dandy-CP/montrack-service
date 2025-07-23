import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { PocketModule } from '../pocket/pocket.module';
import { PocketService } from '../pocket/pocket.service';
import { UploadModule } from '../upload/upload.module';
import { UploadService } from '../upload/upload.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GoalsModule } from '../goals/goals.module';
import { GoalsService } from '../goals/goals.service';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    NestjsFormDataModule,
    WalletModule,
    PocketModule,
    GoalsModule,
    UploadModule,
    SupabaseModule,
    RedisModule,
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    WalletService,
    PocketService,
    GoalsService,
    UploadService,
    RedisService,
  ],
})
export class TransactionModule {}
