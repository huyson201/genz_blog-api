import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  author: User;

  @Prop({ default: [] })
  hashtags: string[];

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
