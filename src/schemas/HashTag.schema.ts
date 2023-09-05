import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<HashTag>;

@Schema({ timestamps: true, collection: 'comments' })
export class HashTag {
  @Prop({ required: true })
  name: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(HashTag);
