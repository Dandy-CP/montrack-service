import { Module } from '@nestjs/common';
import { PocketService } from './pocket.service';
import { PocketController } from './pocket.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [WalletModule, RedisModule],
  controllers: [PocketController],
  providers: [PocketService, WalletService],
})
export class PocketModule {}
