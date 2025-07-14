import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { UploadModule } from '../upload/upload.module';
import { UploadService } from '../upload/upload.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [NestjsFormDataModule, WalletModule, UploadModule, SupabaseModule],
  controllers: [GoalsController],
  providers: [GoalsService, WalletService, UploadService],
})
export class GoalsModule {}
