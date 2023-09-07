import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'myArray exceeds the maximum length of 5' })
  @IsString({ each: true })
  hashtags: string[];
}
