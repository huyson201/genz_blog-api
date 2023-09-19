import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaginationQueryDto } from 'src/post/dto/paginationQueryDto';
import { PostDisplay } from 'src/types/schema';

export class GetPostDto extends PaginationQueryDto {
  @IsEnum(PostDisplay)
  @IsNotEmpty()
  display: PostDisplay;
}
