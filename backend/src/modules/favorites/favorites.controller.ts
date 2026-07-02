import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Post()
  addFavorite(@CurrentUser('id') userId: string, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.addFavorite(userId, dto);
  }

  @Delete(':id')
  removeFavorite(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.favoritesService.removeFavorite(userId, id);
  }
}
