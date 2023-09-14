import { PostDisplay } from './../../types/schema';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public page = 1;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public limit = 5;
}
