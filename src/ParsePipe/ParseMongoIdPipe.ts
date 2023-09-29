import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export class ParseMongoIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!isValidObjectId(value))
      throw new BadRequestException(`${metadata.data} must be a objectId`);
    return value;
  }
}
