import Redis from 'ioredis';
import config from '../../config';
import logger from '../../config/logger';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.REDIS_URL, {
      password: config.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      logger.info('✅ Connected to Redis');
    });

    this.redis.on('error', (error: Error) => {
      logger.error('❌ Redis connection error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error: any) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error: any) {
      logger.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error: any) {
      logger.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key: string, amount = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error: any) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.expire(key, ttlSeconds);
    } catch (error: any) {
      logger.error('Cache expire error:', error);
    }
  }

  async flushPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error: any) {
      logger.error('Cache flush pattern error:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export default new CacheService();
