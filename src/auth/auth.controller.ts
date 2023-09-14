import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';
import { BadRequestExceptionFilter } from '../ExceptionFilter/BadRequestException.filter';
import { LoginDto } from './dto/loginDto';
import { VerifyEmailDto } from './dto/verifyEmailDto';
import { AuthGuard } from '../guards/Auth.guard';
import { User } from '../decorators/user.decorator';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { RefreshAuthGuard } from '../guards/RefreshAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/profile')
  @UseGuards(AuthGuard)
  getProfile(@User() auth: AuthData) {
    return this.authService.getProfile(auth);
  }

  @Get('/posts/:id')
  @UseGuards(AuthGuard)
  getPostById(@User() auth: AuthData, @Param('id') id: string) {
    return this.authService.getPostById(auth, id);
  }

  @Post('/register')
  @UseFilters(BadRequestExceptionFilter)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('/login')
  @UseFilters(BadRequestExceptionFilter)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  logout(@User() auth: AuthData) {
    this.authService.logout(auth);
  }

  @Post('/send-verify')
  @UseGuards(AuthGuard)
  @UseFilters(BadRequestExceptionFilter)
  sendVerifyEmail(@User() auth: AuthData) {
    this.authService.sendVerifyEmail(auth);
  }

  @Post('/verify-email')
  @UseFilters(BadRequestExceptionFilter)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    this.authService.verifyEmail(dto.verifyToken);
  }

  @Post('/refresh-token')
  @UseFilters(BadRequestExceptionFilter)
  @UseGuards(RefreshAuthGuard)
  refreshToken(@Body() dto: RefreshTokenDto, @User() auth: AuthData) {
    return this.authService.refreshToken(auth, dto);
  }
}
