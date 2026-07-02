import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  cityName: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}
