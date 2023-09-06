import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  Get,
} from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';
import { BadRequestExceptionFilter } from 'src/ExceptionFilter/BadRequestException.filter';
import { LoginDto } from './dto/loginDto';
import { VerifyEmailDto } from './dto/verifyEmailDto';
import { AuthGuard } from 'src/guards/Auth.guard';
import { User } from 'src/decorators/user.decorator';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { RefreshAuthGuard } from 'src/guards/RefreshAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/profile')
  @Post('/logout')
  @UseGuards(AuthGuard)
  getProfile(@User() auth: AuthData) {
    return this.authService.getProfile(auth);
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
