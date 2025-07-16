import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: string) {
    return await this.cacheManager.set(key, value);
  }

  async get(key: string) {
    return await this.cacheManager.get(key);
  }

  async getAllKeys(pattern: string, userId: string) {
    const store = this.cacheManager.stores[0];
    const storeKeys: string[] = [];

    if (store?.iterator) {
      for await (const value of store.iterator({})) {
        storeKeys.push(value[0]);
      }
    }

    return storeKeys.filter(
      (value) => value.includes(pattern) && value.includes(userId),
    );
  }

  async delete(key: string) {
    return await this.cacheManager.del(key);
  }

  async clear() {
    return await this.cacheManager.clear();
  }
}
