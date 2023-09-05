import { AuthService } from './auth.service';
import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';
import { BadRequestExceptionFilter } from 'src/ExceptionFilter/BadRequestException.filter';
import { LoginDto } from './dto/loginDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
