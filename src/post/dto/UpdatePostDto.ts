import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { PostDisplay } from 'src/types/schema';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'myArray exceeds the maximum length of 5' })
  @IsString({ each: true })
  hashtags: string[];

  @IsOptional()
  @IsEnum(PostDisplay)
  display: PostDisplay;
}
