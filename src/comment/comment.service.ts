import { CreateCommentDto } from './dto/CreateCommentDto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/schemas/Comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
  ) {}

  async getComments() {
    return this.CommentModel.find();
  }

  async createComment(auth: AuthData, commentData: CreateCommentDto) {
    try {
      const { rootId, parent, ...data } = commentData;
      const comment = new this.CommentModel({ ...data, author: auth._id });

      if (!rootId && !parent) {
        comment.slug = comment._id.toString();
      } else if (rootId === parent) {
        const rootComment = await this.CommentModel.findByIdAndUpdate(
          rootId,
          {
            $inc: {
              replyCount: 1,
            },
          },
          {
            new: true,
          },
        );

        comment.parent = parent;
        comment.slug = `${rootComment.slug}/${comment._id}`;
      } else {
        const rootCommentAsync = this.CommentModel.findByIdAndUpdate(rootId, {
          $inc: {
            replyCount: 1,
          },
        });

        const parentCommentAsync = this.CommentModel.findById(parent);
        const [rootCmt, parentCmt] = await Promise.all([
          rootCommentAsync,
          parentCommentAsync,
        ]);

        comment.slug = `${parentCmt.slug}/${comment._id}`;
      }

      await comment.save();
      await comment.populate('author', '_id email avatar_url name');
      return comment;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
