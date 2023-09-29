import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../guards/Auth.guard';
import { BadRequestExceptionFilter } from '../ExceptionFilter/BadRequestException.filter';
import { User } from '../decorators/user.decorator';
import { CreateCommentDto } from './dto/CreateCommentDto';
import { ParseMongoIdPipe } from 'src/ParsePipe/ParseMongoIdPipe';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getComments() {
    return this.commentService.getComments();
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  createComment(@User() auth: AuthData, @Body() data: CreateCommentDto) {
    return this.commentService.createComment(auth, data);
  }

  @Get('/last')
  @HttpCode(HttpStatus.OK)
  getLastComments() {
    return this.commentService.getLastComments();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  deleteComment(
    @User() auth: AuthData,
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    return this.commentService.deleteComment(auth, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  updateComment(
    @User() auth: AuthData,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body('content') content: string,
  ) {
    return this.commentService.updateComment(auth, id, content);
  }
}
