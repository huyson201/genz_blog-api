import { IsString, ValidateIf, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ValidateIf((object: UpdateProfileDto) => {
    return object.name === undefined || object.avatar_url !== undefined;
  })
  @IsString()
  @IsOptional()
  avatar_url: string;

  @ValidateIf((object: UpdateProfileDto) => {
    return object.avatar_url === undefined || object.name !== undefined;
  })
  @IsOptional()
  @IsString()
  name: string;
}
