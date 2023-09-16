import { PaginationQueryDto } from 'src/post/dto/paginationQueryDto';
import { BadRequestExceptionFilter } from './../ExceptionFilter/BadRequestException.filter';
import { TagService } from './tag.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseFilters,
} from '@nestjs/common';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  getTags(@Query() query: PaginationQueryDto) {
    return this.tagService.getHashtags(query);
  }

  @Get(':slug')
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  getTagBySlug(@Param('slug') slug: string) {
    return this.tagService.getTagBySlug(slug);
  }

  @Get(':slug/posts')
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  getPostsByTagSlug(
    @Param('slug') slug: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.tagService.getPostsByTagSlug(slug, query);
  }
}
