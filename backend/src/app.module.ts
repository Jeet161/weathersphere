import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WeatherModule } from './modules/weather/weather.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { RecentSearchesModule } from './modules/recent-searches/recent-searches.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    WeatherModule,
    FavoritesModule,
    RecentSearchesModule,
    SettingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
