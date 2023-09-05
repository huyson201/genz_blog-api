import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { FileModule } from './file/file.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        port: +process.env.REDIS_PORT,
        tls: {},
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: +process.env.CACHE_TTL || 300,
      store: redisStore,
      url: process.env.REDIS_CACHE_URL,
    }),
    UserModule,
    AuthModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
