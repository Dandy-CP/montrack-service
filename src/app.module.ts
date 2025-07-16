import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { PocketModule } from './pocket/pocket.module';
import { TransactionModule } from './transaction/transaction.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UploadModule } from './upload/upload.module';
import { GoalsModule } from './goals/goals.module';
import { HttpCacheInterceptor } from './cache.interceptor';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            // default store
            createKeyv(process.env.REDIS_URL),

            // Second Storage for fallback stores
            new Keyv({
              store: new CacheableMemory({
                ttl: 3600000, // 1 Hours
                lruSize: 5000,
              }),
            }),
          ],
          ttl: 3600000, // 1 Hours
        };
      },
    }),
    SupabaseModule,
    AuthModule,
    WalletModule,
    PocketModule,
    TransactionModule,
    UploadModule,
    GoalsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor, // default with "CacheInterceptor"
    },
  ],
})
export class AppModule {}
