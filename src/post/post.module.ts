import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { DBPostModule } from '../database/DB.Post.module';
import { DBHashtagModule } from '../database/DB.Hashtag.module';

@Module({
  imports: [DBPostModule, DBHashtagModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
