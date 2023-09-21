import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/decorators/match.decorator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  current_password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  new_password: string;

  @Match('new_password')
  @IsNotEmpty()
  @IsString()
  confirm_new_password: string;
}
