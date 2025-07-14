import { Module } from '@nestjs/common';
import { PocketService } from './pocket.service';
import { PocketController } from './pocket.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [WalletModule],
  controllers: [PocketController],
  providers: [PocketService, WalletService],
})
export class PocketModule {}
