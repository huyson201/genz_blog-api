import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectQueue('send-mail') private sendMail: Queue,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const { name, email, password } = data;

    try {
      const existUser = await this.UserModel.findOne({ email });
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

      // send verify email
      const verifyId = uuidv4();
      this.cache.set(`verify-email:${newUser._id}`, verifyId, {
        ttl: 3600 * 24,
      });

      const verifyEmailURL =
        this.config.get('VERIFY_EMAIL_URL') + `?code=${verifyId}`;
      this.sendMail.add(
        'verify-mail',
        {
          to: [{ email: newUser.email }],
          name: newUser.name,
          verify_url: verifyEmailURL,
        },
        { removeOnComplete: true, removeOnFail: true },
      );
      const { password: userPassword, ...authData } = newUser.toJSON();
      return authData;
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
      });

      verifyUser.remember_tokens.push({
        tokenId,
        token: tokens.refresh_token,
      });

      await verifyUser.save();

      const { password: userPassword, ...user } = verifyUser.toJSON();

      return {
        ...user,
        backendTokens: tokens,
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
      return {
        ...user.toObject(),
        remember_tokens: undefined,
        password: undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  private async generateToken(payload: {
    _id: string;
    email: string;
    tokenId: string;
  }) {
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
    };
  }

  private generateAvatarUrl(name: string) {
    return 'https://ui-avatars.com/api/?background=random&name=' + name;
  }
}
