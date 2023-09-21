import { UpdateProfileDto } from './dto/UpdateProfileDto';
import { createVerifyMailStoreKey } from './../utils/createVerifyMailStoreKey';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './../schemas/User.schema';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/registerDto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/loginDto';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Role } from '../types/schema';
import parseTimePart from 'src/utils/parseTimePart';
import { Post } from 'src/schemas/Post.schema';
import { GoogleService } from 'src/google/google.service';
import { GoogleLoginDto } from './dto/googleLoginDto';
import { Image } from 'src/schemas/Image.schema';
import { GetPostDto } from './dto/getPostsDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Post.name) private readonly PostModel: Model<Post>,
    @InjectModel(Image.name) private readonly ImageModel: Model<Image>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectQueue('send-mail') private sendMail: Queue,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private googleService: GoogleService,
  ) {}

  async register(data: RegisterDto) {
    const { name, email, password } = data;

    try {
      const existUser = await this.UserModel.findOne({
        email: new RegExp(`^${email}$`, 'i'),
      });
      if (existUser) {
        throw new ConflictException('email exist!');
      }

      const hashPassword = bcrypt.hashSync(password, 10);
      const newUser = new this.UserModel({
        name,
        email,
        password: hashPassword,
        avatar_url: this.generateAvatarUrl(name),
      });

      await newUser.save();

      return {
        ...newUser.toJSON(),
        password: undefined,
        remember_tokens: undefined,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async login(data: LoginDto) {
    const { email, password } = data;
    try {
      const verifyUser = await this.UserModel.findOne({ email });
      if (!verifyUser)
        throw new UnauthorizedException('Email or password invalid!');
      const isPassword = bcrypt.compareSync(password, verifyUser.password);
      if (!isPassword)
        throw new UnauthorizedException('Email or password invalid!');

      // generate tokenId
      const tokenId = uuidv4();

      const tokens = await this.generateToken({
        email: verifyUser.email,
        _id: verifyUser._id.toString(),
        tokenId,
        role: verifyUser.role,
      });

      verifyUser.remember_tokens.push({
        tokenId,
        token: tokens.refresh_token,
      });

      await verifyUser.save();

      return {
        ...verifyUser.toJSON(),
        backendTokens: tokens,
        password: undefined,
        remember_tokens: undefined,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logout(authData: AuthData) {
    try {
      const user = await this.UserModel.findById(authData._id);
      if (!user) throw new UnauthorizedException();
      user.remember_tokens = user.remember_tokens.filter(
        (value) => value.tokenId !== authData.tokenId,
      );
      await user.save();
      return {
        message: 'Successfully logged out',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(authData: AuthData, data: RefreshTokenDto) {
    try {
      const user = await this.UserModel.findById(authData._id);
      if (
        !user ||
        !user.remember_tokens.some(
          (tokenObj) =>
            tokenObj.tokenId === authData.tokenId &&
            tokenObj.token === data.refresh_token,
        )
      ) {
        throw new UnauthorizedException();
      }

      const tokenId = uuidv4();
      const tokens = await this.generateToken({
        _id: authData._id,
        email: authData.email,
        tokenId,
        role: authData.role,
      });

      // delete old token
      user.remember_tokens = user.remember_tokens.filter(
        (tokenObj) => tokenObj.tokenId !== authData.tokenId,
      );

      // add new token
      user.remember_tokens.push({
        tokenId,
        token: tokens.refresh_token,
      });

      await user.save();

      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async getProfile(authData: AuthData) {
    try {
      const user = await this.UserModel.findById(authData._id);
      if (!user) throw new NotFoundException('User not found');
      return {
        ...user.toObject(),
        remember_tokens: undefined,
        password: undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async sendVerifyEmail(data: AuthData) {
    try {
      const user = await this.UserModel.findById(data._id).select(
        '_id email name',
      );
      const verifyToken = await this.generateVerifyEmailToken({
        _id: data._id,
        email: data.email,
        role: user.role,
      });
      const verifyUrl = this.createVerifyUrl(verifyToken);
      // save verify token to cache
      this.cache.set(
        createVerifyMailStoreKey(data._id.toString()),
        verifyToken,
        {
          ttl: 3600 * 24,
        },
      );

      return this.sendMail.add(
        'verify-mail',
        {
          to: [{ email: data.email }],
          name: user.name,
          verify_url: verifyUrl,
        },
        { removeOnComplete: true, removeOnFail: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(verifyToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(verifyToken, {
        secret: this.config.get('JWT_VERIFY_EMAIL_SECRET'),
      });

      const storedVerifyToken: string = await this.cache.get(
        createVerifyMailStoreKey(payload._id),
      );

      if (!storedVerifyToken)
        throw new BadRequestException('Verify url invalid or expired!');

      const user = await this.UserModel.findByIdAndUpdate(
        payload._id,
        {
          $set: {
            verified: true,
          },
        },
        { new: true },
      );

      return {
        ...user.toJSON(),
        password: undefined,
        remember_tokens: undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPostById(auth: AuthData, postId: string) {
    try {
      const post = await this.PostModel.findOne({
        _id: postId,
        author: auth._id,
      })
        .populate('hashtags', '_id name slug')
        .populate('author', '_id name email avatar_url');
      if (!post) throw new NotFoundException(`Post ${postId} not found!`);
      return post;
    } catch (error) {
      throw error;
    }
  }

  async getPostsByAuth(auth: AuthData, query: GetPostDto) {
    const { page, limit, display, q } = query;
    const skip = (page - 1) * limit;
    try {
      const search = q && q !== '' ? { $text: { $search: q } } : {};

      const countPromise = this.PostModel.count({
        author: auth._id,
        display: display,
        ...search,
      }).exec();
      const postPromise = this.PostModel.find({
        author: auth._id,
        display: display,
        ...search,
      })
        .populate('hashtags', '_id name slug')
        .populate('author', '_id avatar_url name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const [count, posts] = await Promise.all([countPromise, postPromise]);
      return this.createPaginationDoc(count, page, limit, posts);
    } catch (error) {
      throw error;
    }
  }

  async googleSignIn({ idToken }: GoogleLoginDto) {
    try {
      const { payload, userId } = await this.googleService.verifyIdToken(
        idToken,
      );
      let user = await this.UserModel.findOne({
        email: new RegExp(`^${payload.email}$`, 'i'),
      });

      if (user) {
        user.verified = payload.email_verified;
        user.googleOAuth = {
          googleId: userId,
        };
        if (user.avatar_url.includes('ui-avatars.com')) {
          user.avatar_url = payload.picture;
        }
      } else {
        user = new this.UserModel({
          email: payload.email,
          name: `${payload.name}`,
          avatar_url: payload.picture,
          verified: payload.email_verified,
          googleOAuth: {
            googleId: userId,
          },
        });
      }

      // generate tokenId
      const tokenId = uuidv4();

      const tokens = await this.generateToken({
        email: user.email,
        _id: user._id.toString(),
        tokenId,
        role: user.role,
      });

      user.remember_tokens.push({
        tokenId,
        token: tokens.refresh_token,
      });

      await user.save();

      return {
        ...user.toJSON(),
        password: undefined,
        remember_tokens: undefined,
        backendTokens: tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async getImages(auth: AuthData) {
    try {
      const images = await this.ImageModel.find({ user: auth._id }).sort({
        createdAt: -1,
      });
      return images;
    } catch (error) {
      throw error;
    }
  }

  async ChangePassword(auth: AuthData, data: ChangePasswordDto) {
    try {
      const user = await this.UserModel.findById(auth._id);
      if (!user) throw new NotFoundException('User not found!');
      const checkPassword = bcrypt.compareSync(
        data.current_password,
        user.password,
      );
      if (!checkPassword) throw new BadRequestException('Invalid password!');
      const hashPw = bcrypt.hashSync(data.new_password, 10);
      user.password = hashPw;
      await user.save();
      return {
        ...user.toJSON(),
        password: undefined,
        remember_tokens: undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(auth: AuthData, data: UpdateProfileDto) {
    try {
      const user = await this.UserModel.findById(auth._id);
      if (!user) throw new NotFoundException('User not found!');
      user.avatar_url = data.avatar_url || user.avatar_url;
      user.name = data.name || user.name;
      await user.save();
      return {
        ...user.toJSON(),
        password: undefined,
        remember_tokens: undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  private async generateToken(payload: {
    _id: string;
    email: string;
    tokenId: string;
    role: Role;
  }) {
    const expireTimeString = this.config.get('JWT_EXPIRE');
    const expireTimeNumber = parseTimePart(expireTimeString);

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '100d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
      expiresIn: new Date().setTime(new Date().getTime() + expireTimeNumber),
    };
  }

  private async generateVerifyEmailToken(payload: {
    _id: string;
    email: string;
    role: Role;
  }) {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_VERIFY_EMAIL_SECRET'),
      expiresIn: '1d',
    });
    return token;
  }

  private createVerifyUrl(token: string) {
    return this.config.get('VERIFY_EMAIL_URL') + `?code=${token}`;
  }

  private generateAvatarUrl(name: string) {
    return 'https://ui-avatars.com/api/?background=random&name=' + name;
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
