import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { DBPostModule } from 'src/database/DB.Post.module';
import { DBHashtagModule } from 'src/database/DB.Hashtag.module';

@Module({
  imports: [DBPostModule, DBHashtagModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}