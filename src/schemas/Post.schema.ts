import { PostDisplay } from 'src/types/schema';
import { Hashtag } from '../schemas/tag.schema';
import { User } from '../schemas/User.schema';

import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
export type PostDocument = HydratedDocument<Post>;
@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  author: User;

  @Prop({
    default: [],
    type: [{ type: mongoose.Types.ObjectId, ref: 'Hashtag' }],
    required: false,
  })
  hashtags: Hashtag[];

  @Prop({ default: PostDisplay.JUST_ME, enum: PostDisplay, required: true })
  display: PostDisplay;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
