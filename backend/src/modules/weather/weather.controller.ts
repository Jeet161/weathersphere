import { Controller, Get, Query, UseGuards, ParseFloatPipe } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  getCurrentWeather(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
    @Query('units') units?: string,
  ) {
    return this.weatherService.getCurrentWeather(lat, lon, units ?? 'metric');
  }

  @Get('forecast')
  getForecast(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
    @Query('units') units?: string,
  ) {
    return this.weatherService.getForecast(lat, lon, units ?? 'metric');
  }

  @Get('air-quality')
  getAirQuality(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.getAirQuality(lat, lon);
  }

  @Get('search')
  searchCities(@Query('q') query: string) {
    return this.weatherService.searchCities(query);
  }

  @Get('reverse-geocode')
  reverseGeocode(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.reverseGeocode(lat, lon);
  }
}
