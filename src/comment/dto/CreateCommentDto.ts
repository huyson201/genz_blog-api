import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  post?: string;

  @IsString()
  @IsOptional()
  parent?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
