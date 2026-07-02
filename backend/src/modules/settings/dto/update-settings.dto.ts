import { IsString, IsOptional, IsIn, IsNumber } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsIn(['celsius', 'fahrenheit'])
  @IsOptional()
  tempUnit?: string;

  @IsString()
  @IsIn(['kmh', 'mph', 'ms'])
  @IsOptional()
  windUnit?: string;

  @IsString()
  @IsIn(['light', 'dark', 'system'])
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  defaultCity?: string;

  @IsNumber()
  @IsOptional()
  defaultLat?: number;

  @IsNumber()
  @IsOptional()
  defaultLon?: number;
}
