import { CreateCommentDto } from './dto/CreateCommentDto';
import {
  Injectable,
  Param,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
        const parentComment = await this.CommentModel.findById(parent);
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

  async getLastComments() {
    try {
      return this.CommentModel.find({ parent: '' })
        .populate('author', '_id name avatar_url email')
        .limit(10)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(auth: AuthData, id: string) {
    try {
      const comment = await this.CommentModel.findById(id);
      if (!comment) throw new NotFoundException();

      if (String(comment.author) !== auth._id) throw new ForbiddenException();

      if (comment.parent === '') {
        return await comment.deleteOne();
      }

      const parents = comment.slug
        .split('/')
        .filter((value) => value !== comment._id.toString());

      if (parents.length === 0) return await comment.deleteOne();

      await this.CommentModel.updateMany(
        {
          _id: { $in: parents },
        },
        {
          $inc: { replyCount: -1 },
        },
      );
      return await comment.deleteOne();
    } catch (error) {
      throw error;
    }
  }

  async updateComment(auth: AuthData, id: string, content: string) {
    try {
      const comment = await this.CommentModel.findById(id);
      if (!comment) throw new NotFoundException('Comment not found!');
      if (String(comment.author) !== auth._id) throw new ForbiddenException();
      comment.content = content;
      return await comment.save();
    } catch (error) {
      throw error;
    }
  }
}
