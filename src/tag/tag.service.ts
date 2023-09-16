import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from 'src/post/dto/paginationQueryDto';
import { Post } from 'src/schemas/Post.schema';
import { Hashtag } from 'src/schemas/tag.schema';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Hashtag.name) private HashTag: Model<Hashtag>,
    @InjectModel(Post.name) private PostModel: Model<Post>,
  ) {}

  async getHashtags(query: PaginationQueryDto) {
    const { page, limit } = query;
    const startIndex = (page - 1) * limit;
    try {
      const countPromise = this.HashTag.count().exec();
      const hashtagsPromise = this.HashTag.find()
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const [count, hashtags] = await Promise.all([
        countPromise,
        hashtagsPromise,
      ]);
      return this.createPaginationDoc(count, page, limit, hashtags);
    } catch (error) {
      throw error;
    }
  }

  async getPostsByTagSlug(slug: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    const startIndex = (page - 1) * limit;
    try {
      const tag = await this.HashTag.findOne({ slug });
      if (!tag) throw new NotFoundException();
      const countPromise = this.PostModel.count({ hashtags: tag._id }).exec();
      const postsPromise = this.PostModel.find({ hashtags: tag._id })
        .populate('hashtags', '_id name slug')
        .populate('author', '_id avatar_url name email')
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const [count, posts] = await Promise.all([countPromise, postsPromise]);
      return this.createPaginationDoc(count, page, limit, posts);
    } catch (error) {
      throw error;
    }
  }

  private createPaginationDoc(
    totalDocs: number,
    page: number,
    limit: number,
    docs: any,
  ) {
    const totalPages = Math.ceil(totalDocs / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      totalDocs: totalDocs,
      totalPages,
      page,
      limit,
      prevPage,
      nextPage,
      docs,
    };
  }

  async getTagBySlug(slug: string) {
    try {
      const tag = await this.HashTag.findOne({ slug });
      if (!tag) throw new NotFoundException();
      return tag;
    } catch (error) {
      throw error;
    }
  }
}
