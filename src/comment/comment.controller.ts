import {
  Body,
  Controller,
  Get,
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
}
