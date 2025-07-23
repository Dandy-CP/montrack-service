import { Reflector } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Cache } from 'cache-manager';
import { RedisService } from './redis/redis.service';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    protected readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const methode = request.method;
    const baseEndpoint = request.url.split('/')[1];
    const prefixEndpoint = request.url.split('/')[2];
    const storeId = `${baseEndpoint}-${prefixEndpoint}:${request?.user?.user_id}`;

    const ignoreCaching = this.reflector.get<boolean>(
      'ignoreCaching',
      context.getHandler(),
    );

    if (ignoreCaching) return undefined; // Do not store cache if 'ignoreCaching' metadata is true
    if (methode !== 'GET') return undefined; // Do not store cache if methode except GET

    return storeId;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const methode = request.method;
    const baseEndpoint = request.url.split('/')[1];

    const keys = await this.redisService.getAllKeys(
      request?.user?.user_id,
      baseEndpoint,
    );

    const ignoreCaching = this.reflector.get<boolean>(
      'ignoreCaching',
      context.getHandler(),
    );

    // if decorator @NoCache declare then return to next function
    // without checking stored value to invalidate
    if (ignoreCaching) return next.handle().pipe();

    // if methode GET then handle with super
    if (methode === 'GET') {
      return super.intercept(context, next);
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(methode)) {
      // loop array of string value to delete each keys
      for (const value of keys) {
        await this.redisService.delete(value);
      }
    }

    // return to next function
    return next.handle().pipe();
  }
}
