import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HashTagDocument = HydratedDocument<Hashtag>;

@Schema({ timestamps: true, collection: 'hashtags', autoIndex: true })
export class Hashtag {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
export const HashtagSchema = SchemaFactory.createForClass(Hashtag);
HashtagSchema.index({ slug: 1, name: 1 }, { unique: true });
