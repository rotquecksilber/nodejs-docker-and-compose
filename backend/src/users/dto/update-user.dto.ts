import { IsEmail, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(2, 30)
  @IsOptional()
  username?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsString()
  @Length(2, 200)
  @IsOptional()
  about?: string;
}
