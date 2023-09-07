import { DBCommentModule } from './../database/DB.Comment.module';
import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [DBCommentModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
