import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { catchError, map, of, throwError } from 'rxjs';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const data = this.reflector.get<string | ((req: Request) => string)>(
      'custom-cacheKey',
      context.getHandler(),
    );

    try {
      const key = typeof data === 'string' ? data : data(request);

      const handlePipeMap = map(async (data) => {
        if (key !== '') {
          await this.cache.set(key, data, { ttl: 300 });
        }
        return data;
      });

      const handlePipeError = catchError((error) => throwError(() => error));

      if (key === '') {
        return next.handle().pipe(handlePipeMap, handlePipeError);
      }
      const cacheData = await this.cache.get(key);
      if (!cacheData) {
        return next.handle().pipe(handlePipeMap);
      }
      console.log('cache----');
      return of(cacheData);
    } catch (error) {
      return throwError(() => error);
    }
  }
}
