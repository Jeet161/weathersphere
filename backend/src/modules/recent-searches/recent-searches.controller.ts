import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RecentSearchesService } from './recent-searches.service';
import { CreateRecentSearchDto } from './dto/create-recent-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('recent-searches')
@UseGuards(JwtAuthGuard)
export class RecentSearchesController {
  constructor(private readonly recentSearchesService: RecentSearchesService) {}

  @Get()
  getRecentSearches(@CurrentUser('id') userId: string) {
    return this.recentSearchesService.getRecentSearches(userId);
  }

  @Post()
  addRecentSearch(@CurrentUser('id') userId: string, @Body() dto: CreateRecentSearchDto) {
    return this.recentSearchesService.addRecentSearch(userId, dto);
  }

  @Delete()
  clearRecentSearches(@CurrentUser('id') userId: string) {
    return this.recentSearchesService.clearRecentSearches(userId);
  }

  @Delete(':id')
  removeRecentSearch(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recentSearchesService.removeRecentSearch(userId, id);
  }
}
