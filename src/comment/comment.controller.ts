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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../guards/Auth.guard';
import { BadRequestExceptionFilter } from '../ExceptionFilter/BadRequestException.filter';
import { User } from '../decorators/user.decorator';
import { CreateCommentDto } from './dto/CreateCommentDto';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  getComments() {
    return this.commentService.getComments();
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  createComment(@User() auth: AuthData, @Body() data: CreateCommentDto) {
    return this.commentService.createComment(auth, data);
  }

  @Get('/last')
  getLastComments() {
    return this.commentService.getLastComments();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  deleteComment(@User() auth: AuthData, @Param('id') id: string) {
    return this.commentService.deleteComment(auth, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  updateComment(
    @User() auth: AuthData,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    return this.commentService.updateComment(auth, id, content);
  }
}
