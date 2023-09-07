import { IsString, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';

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
}
