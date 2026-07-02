import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(60)
  displayName?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
