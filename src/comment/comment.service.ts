import { CreateCommentDto } from './dto/CreateCommentDto';
import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../schemas/Comment.schema';

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
      const { parent, ...data } = commentData;
      const comment = new this.CommentModel({
        parent: parent,
        content: data.content,
        post: data.post,
        author: auth._id,
      });

      if (parent !== '') {
        const parentComment = await this.CommentModel.findOne({ _id: parent });
        if (!parentComment) {
          comment.slug = `${comment._id}`;
        } else {
          comment.parent = parent;
          comment.slug = `${parentComment.slug}/${comment._id}`;

          // update count reply
          const parentComments = parentComment.slug.split('/');

          await this.CommentModel.updateMany(
            {
              _id: { $in: parentComments },
            },
            {
              $inc: { replyCount: 1 },
            },
          );
        }
      } else {
        console.log(comment._id);
        comment.slug = `${comment._id}`;
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
