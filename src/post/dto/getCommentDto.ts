import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './paginationQueryDto';

export class GetCommentDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  parent?: string;
}
