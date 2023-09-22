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
import { BadRequestExceptionFilter } from '../ExceptionFilter/BadRequestException.filter';
import { User } from '../decorators/user.decorator';
import { PaginationQueryDto } from './dto/paginationQueryDto';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../types/schema';
import { SearchQueryDto } from './dto/SearchQueryDto';
import { GetCommentDto } from './dto/getCommentDto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  getPosts(@Query() query: PaginationQueryDto) {
    return this.postService.getPosts(query);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UseFilters(BadRequestExceptionFilter)
  searchPosts(@Query() query: SearchQueryDto) {
    return this.postService.searchPosts(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }
  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  getComments(@Param('id') id: string, @Query() query: GetCommentDto) {
    return this.postService.getComment(id, query);
  }
  @Post()
  @Roles(Role.Admin)
  @UseFilters(BadRequestExceptionFilter)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() data: CreatePostDto, @User() auth: AuthData) {
    return this.postService.createPost(data, auth);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
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
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  increasePostView(@Param('id') id: string) {
    return this.postService.increaseView(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  deletePost(@Param('id') id: string, @User() auth: AuthData) {
    return this.postService.deletePost(auth, id);
  }
}
