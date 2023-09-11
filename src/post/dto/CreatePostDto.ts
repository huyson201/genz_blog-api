import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { PostDisplay } from 'src/types/schema';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(PostDisplay)
  display: PostDisplay;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'myArray exceeds the maximum length of 5' })
  @IsString({ each: true })
  hashtags: string[];
}
