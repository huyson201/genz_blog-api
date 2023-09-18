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

@Controller('auth')
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

  @Get('/posts/:id')
  @Roles(Role.Admin)
  @UseFilters(BadRequestExceptionFilter)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  getPostById(@User() auth: AuthData, @Param('id') id: string) {
    return this.authService.getPostById(auth, id);
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(BadRequestExceptionFilter)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UseFilters(BadRequestExceptionFilter)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('/login/google')
  @HttpCode(HttpStatus.OK)
  @UseFilters(BadRequestExceptionFilter)
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleSignIn(dto);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseFilters(BadRequestExceptionFilter)
  logout(@User() auth: AuthData) {
    this.authService.logout(auth);
  }

  @Post('/send-verify')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  sendVerifyEmail(@User() auth: AuthData) {
    this.authService.sendVerifyEmail(auth);
  }

  @Post('/verify-email')
  @UseFilters(BadRequestExceptionFilter)
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    this.authService.verifyEmail(dto.verifyToken);
  }

  @Post('/refresh-token')
  @UseFilters(BadRequestExceptionFilter)
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto, @User() auth: AuthData) {
    return this.authService.refreshToken(auth, dto);
  }
}
