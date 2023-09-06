import { UserSchema } from './../schemas/User.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from 'src/schemas/Image.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  exports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
})
export class DBImageModule {}
