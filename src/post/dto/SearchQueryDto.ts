import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationQueryDto } from './paginationQueryDto';

export class SearchQueryDto extends PaginationQueryDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}
