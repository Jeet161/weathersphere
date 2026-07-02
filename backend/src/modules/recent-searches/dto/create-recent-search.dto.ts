import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateRecentSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;

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
