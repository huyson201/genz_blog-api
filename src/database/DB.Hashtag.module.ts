import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hashtag, HashtagSchema } from '../schemas/tag.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hashtag.name, schema: HashtagSchema }]),
  ],
  exports: [
    MongooseModule.forFeature([{ name: Hashtag.name, schema: HashtagSchema }]),
  ],
})
export class DBHashtagModule {}
