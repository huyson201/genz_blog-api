import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { FileModule } from './file/file.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PostModule } from './post/post.module';
import * as redisStore from 'cache-manager-redis-store';
import { CommentModule } from './comment/comment.module';
import { TagModule } from './tag/tag.module';

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
    PostModule,
    CommentModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
