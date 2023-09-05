import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Post } from './Post.schema';
import { User } from './User.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'posts' })
  postId: Post;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'users' })
  author: User;

  @Prop({ default: '' })
  parent: string;

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
