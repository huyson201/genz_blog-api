import { DBPostModule } from './../database/DB.Post.module';
import { DBHashtagModule } from './../database/DB.Hashtag.module';
import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [DBHashtagModule, DBPostModule],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
