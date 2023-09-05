import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Match } from 'src/decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;

  @Match('password')
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  confirm_password: string;
}
