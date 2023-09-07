import { UpdatePostDto } from './dto/UpdatePostDto';
import { AuthGuard } from './../guards/Auth.guard';
import { CreatePostDto } from './dto/CreatePostDto';
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseFilters,
  UseGuards,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { PostService } from './post.service';
import { BadRequestExceptionFilter } from 'src/ExceptionFilter/BadRequestException.filter';
import { User } from 'src/decorators/user.decorator';
import { PaginationQueryDto } from './dto/paginationQueryDto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  getPosts(@User() auth: AuthData, @Query() query: PaginationQueryDto) {
    return this.postService.getPosts(auth, query);
  }

  @Post()
  @UseFilters(BadRequestExceptionFilter)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() data: CreatePostDto, @User() auth: AuthData) {
    return this.postService.createPost(data, auth);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  updatePost(
    @Param('id') id: string,
    @User() auth: AuthData,
    @Body() data: UpdatePostDto,
  ) {
    return this.postService.updatePost(auth, id, data);
  }

  @Patch(':id/view/increase')
  @HttpCode(HttpStatus.OK)
  increasePostView(@Param('id') id: string) {
    return this.postService.increaseView(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  deletePost(@Param('id') id: string, @User() auth: AuthData) {
    return this.postService.deletePost(auth, id);
  }
}
