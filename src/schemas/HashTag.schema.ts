import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type HashTagDocument = HydratedDocument<HashTag>;

@Schema({ timestamps: true, collection: 'hashtags', autoIndex: true })
export class HashTag {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
const HashTagSchema = SchemaFactory.createForClass(HashTag);
HashTagSchema.index({ slug: 1, name: 1 }, { unique: true });
export { HashTagSchema };
