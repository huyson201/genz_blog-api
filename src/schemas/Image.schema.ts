import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User.schema';

export type ImageDocument = HydratedDocument<Image>;

@Schema({ timestamps: true, collection: 'images', autoIndex: true })
export class Image {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ index: true })
  public_id: string;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop()
  format: string;

  @Prop()
  resource_type: string;

  @Prop()
  type: string;

  @Prop()
  url: string;

  @Prop()
  secure_url: string;

  @Prop()
  original_filename: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
export const ImageSchema = SchemaFactory.createForClass(Image);
