import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Post } from './Post.schema';
import { GoogleOAuth, RememberToken, Role } from '../types/schema';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ default: '' })
  avatar_url: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: false, type: Object })
  googleOAuth?: GoogleOAuth;

  @Prop({ default: false, required: true })
  verified: boolean;

  @Prop({ default: Role.User, enum: Role, required: true })
  role: Role;

  @Prop({ default: [] })
  remember_tokens: Array<RememberToken>;

  @Prop({ default: [], type: Array<mongoose.Types.ObjectId>, ref: 'Post' })
  viewHistory: Post[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
