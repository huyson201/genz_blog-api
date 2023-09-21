import { UpdateProfileDto } from './dto/UpdateProfileDto';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
} from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';
import { BadRequestExceptionFilter } from '../ExceptionFilter/BadRequestException.filter';
import { LoginDto } from './dto/loginDto';
import { VerifyEmailDto } from './dto/verifyEmailDto';
import { AuthGuard } from '../guards/Auth.guard';
import { User } from '../decorators/user.decorator';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { RefreshAuthGuard } from '../guards/RefreshAuth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from 'src/types/schema';
import { GoogleLoginDto } from './dto/googleLoginDto';
import { GetPostDto } from './dto/getPostsDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';

@Controller('auth')
@UseFilters(BadRequestExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/profile')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@User() auth: AuthData) {
    return this.authService.getProfile(auth);
  }

  @Get('/gallery')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  getImages(@User() auth: AuthData) {
    return this.authService.getImages(auth);
  }

  @Get('/posts')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  getPosts(@User() auth: AuthData, @Query() query: GetPostDto) {
    return this.authService.getPostsByAuth(auth, query);
  }

  @Get('/posts/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  getPostById(@User() auth: AuthData, @Param('id') id: string) {
    return this.authService.getPostById(auth, id);
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('/login/google')
  @HttpCode(HttpStatus.OK)
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleSignIn(dto);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@User() auth: AuthData) {
    this.authService.logout(auth);
  }

  @Post('/send-verify')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  sendVerifyEmail(@User() auth: AuthData) {
    this.authService.sendVerifyEmail(auth);
  }

  @Post('/verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    this.authService.verifyEmail(dto.verifyToken);
  }

  @Post('/refresh-token')
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto, @User() auth: AuthData) {
    return this.authService.refreshToken(auth, dto);
  }

  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('/change-password')
  changePassword(@User() user: AuthData, @Body() data: ChangePasswordDto) {
    return this.authService.ChangePassword(user, data);
  }

  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('/profile')
  updateProfile(@User() user: AuthData, @Body() data: UpdateProfileDto) {
    return this.authService.updateProfile(user, data);
  }
}
