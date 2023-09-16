import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

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
