import { UpdatePostDto } from './dto/UpdatePostDto';
import { CreatePostDto } from './dto/CreatePostDto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hashtag } from '../schemas/tag.schema';
import { Post } from '../schemas/Post.schema';
import { slugify } from '../utils/slugify';
import { PaginationQueryDto } from './dto/paginationQueryDto';
import { PostDisplay } from 'src/types/schema';
import { SearchQueryDto } from './dto/SearchQueryDto';
import { Comment } from 'src/schemas/Comment.schema';
import { GetCommentDto } from './dto/getCommentDto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { POST_KEY_PREFIX } from 'src/libs/CacheKey.constant';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<Post>,
    @InjectModel(Hashtag.name) private HashtagModel: Model<Hashtag>,
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}
  async getPosts(query: PaginationQueryDto) {
    const { page, limit } = query;
    const startIndex = (page - 1) * limit;

    try {
      const postCountAsync = this.PostModel.count({
        display: PostDisplay.PUBLIC,
      }).exec();
      const postsAsync = this.PostModel.find({
        display: PostDisplay.PUBLIC,
      })
        .populate('hashtags', '_id name slug')
        .populate('author', '_id avatar_url name email')
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const [count, posts] = await Promise.all([postCountAsync, postsAsync]);
      return this.createPaginationDoc(count, page, limit, posts);
    } catch (error) {
      throw error;
    }
  }

  async getPostById(id: string) {
    console.log('get post by id');
    try {
      const post = await this.PostModel.findById(id)
        .where('display')
        .equals(PostDisplay.PUBLIC)
        .populate('hashtags')
        .populate('author', '_id name avatar_url email');
      if (!post) throw new NotFoundException(`Not found Post with id: ${id}!`);
      return post;
    } catch (error) {
      throw error;
    }
  }

  async createPost(data: CreatePostDto, auth: AuthData) {
    const { hashtags, ...postData } = data;
    let savedHashTags = [];
    if (hashtags) {
      savedHashTags = await this.checkOrCreateHashtags(hashtags);
    }
    const post = new this.PostModel({
      ...postData,
      hashtags: savedHashTags.map((item) => item._id),
      author: auth._id,
    });
    await post.save();

    return await post.populate('hashtags', '_id name slug');
  }

  async updatePost(auth: AuthData, postId: string, data: UpdatePostDto) {
    try {
      const { hashtags, ...dataUpdate } = data;
      const post = await this.PostModel.findOne({
        author: auth._id,
        _id: postId,
      });

      if (hashtags) {
        const savedHashtags = await this.checkOrCreateHashtags(hashtags);
        post.hashtags = savedHashtags;
      }

      post.title = dataUpdate.title || post.title;
      post.content = dataUpdate.content || post.content;
      post.description = dataUpdate.description || post.description;
      post.display = dataUpdate.display || post.display;
      post.updatedAt = new Date();
      await post.save();
      await this.cache.set(`${POST_KEY_PREFIX}::${postId}`, post);
      return await post.populate('hashtags', '_id name slug');
    } catch (error) {
      throw error;
    }
  }
  async deletePost(auth: AuthData, postId: string) {
    try {
      await this.PostModel.findOneAndDelete({
        _id: postId,
        author: auth._id,
      });
      await this.cache.del(`${POST_KEY_PREFIX}::${postId}`);
      return {
        message: 'delete success!',
      };
    } catch (error) {
      throw error;
    }
  }

  async increaseView(postId: string, ip: string) {
    try {
      const checkViewHasIncrease = await this.cache.get(
        `${ip}-${postId}-increaseView`,
      );
      if (checkViewHasIncrease) {
        return {
          message: 'success',
          success: true,
        };
      }
      const post = await this.PostModel.findByIdAndUpdate(
        postId,
        {
          $inc: { viewCount: 1 },
        },
        { new: true },
      );
      await this.cache.set(`${POST_KEY_PREFIX}::${postId}`, post);
      await this.cache.set(`${ip}-${postId}-increaseView`, true, {
        ttl: 3600,
      });
      return post;
    } catch (error) {
      throw error;
    }
  }

  async searchPosts(query: SearchQueryDto) {
    const { q, page, limit } = query;
    const startIndex = (page - 1) * limit;
    try {
      const filter = {
        $text: { $search: q },
        display: PostDisplay.PUBLIC,
      };
      const countPromise = this.PostModel.count(filter).exec();
      const postsPromise = this.PostModel.find(filter)
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

  async getComment(postId: string, query: GetCommentDto) {
    const { page, limit, parent } = query;
    const skip = (page - 1) * limit;
    let queryData: Record<string, any> = {};

    try {
      if (parent && parent !== '') {
        return await this.CommentModel.find({
          post: postId,
          slug: new RegExp(parent, 'i'),
        })
          .populate('author', '_id name avatar_url email')
          .sort({ createdAt: -1 })
          .exec();
      }
      queryData = {
        post: postId,
        parent: '',
      };

      const countPromise = this.CommentModel.count(queryData).exec();

      const commentsPromise = this.CommentModel.find(queryData)
        .populate('author', '_id name avatar_url email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const [count, comments] = await Promise.all([
        countPromise,
        commentsPromise,
      ]);
      return this.createPaginationDoc(count, page, limit, comments);
    } catch (error) {
      throw error;
    }
  }

  private async checkOrCreateHashtags(hashtags: string[]) {
    if (hashtags.length <= 0) return [];

    const createdTags = hashtags.map(async (tag) => {
      const existingTag = await this.HashtagModel.findOne({
        name: new RegExp(`^${tag}$`, 'i'),
      });
      if (existingTag) return existingTag;

      const newTags = await this.HashtagModel.create({
        name: tag,
        slug: slugify(tag),
      });
      return newTags;
    });

    return await Promise.all(createdTags);
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
}
