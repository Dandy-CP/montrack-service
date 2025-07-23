import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: string, ttl?: number) {
    return await this.cacheManager.set(key, value, ttl);
  }

  async get(key: string) {
    const valueInCache = await this.cacheManager.get(key);

    if (valueInCache) {
      return (await this.cacheManager.get(key)) as string;
    }

    throw new NotFoundException('Value not exist');
  }

  async getAllKeys(userId: string, pattern?: string) {
    const store = this.cacheManager.stores[0];
    const storeKeys: string[] = [];

    if (store?.iterator) {
      for await (const value of store.iterator({})) {
        storeKeys.push(value[0]);
      }
    }

    return storeKeys.filter(
      (value) => value.includes(pattern ?? '') && value.includes(userId),
    );
  }

  async delete(key: string) {
    return await this.cacheManager.del(key);
  }

  async clear() {
    return await this.cacheManager.clear();
  }

  async setUserSession(payload: {
    user_id: string;
    name: string;
    email: string;
    access_token: string;
    refresh_token: string;
  }) {
    await this.cacheManager.set(
      `session:${payload.user_id}`,
      {
        user_id: payload.user_id,
        name: payload.name,
        email: payload.email,
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      },
      Number(process.env.USER_SESSION_TTL),
    );
  }
}
