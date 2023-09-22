import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Post } from './Post.schema';
import { User } from './User.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Post' })
  post: Post;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: 'Comment',
    require: false,
    default: '',
  })
  parent: string;

  @Prop()
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  replyCount: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
