import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export const CustomCacheKey = (
  data: string | ((request: Request) => string),
) => {
  return SetMetadata('custom-cacheKey', data);
};
