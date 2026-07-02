import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRecentSearchDto } from './dto/create-recent-search.dto';

const MAX_RECENT = 10;

@Injectable()
export class RecentSearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentSearches(userId: string) {
    return this.prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: MAX_RECENT,
    });
  }

  async addRecentSearch(userId: string, dto: CreateRecentSearchDto) {
    // Upsert by city coords — update timestamp if already exists
    const existing = await this.prisma.recentSearch.findFirst({
      where: { userId, lat: dto.lat, lon: dto.lon },
    });

    if (existing) {
      return this.prisma.recentSearch.update({
        where: { id: existing.id },
        data: { searchedAt: new Date(), query: dto.query },
      });
    }

    const created = await this.prisma.recentSearch.create({
      data: { userId, ...dto },
    });

    // Prune oldest entries beyond MAX_RECENT
    const all = await this.prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      select: { id: true },
    });

    if (all.length > MAX_RECENT) {
      const toDelete = all.slice(MAX_RECENT).map((r) => r.id);
      await this.prisma.recentSearch.deleteMany({ where: { id: { in: toDelete } } });
    }

    return created;
  }

  async clearRecentSearches(userId: string) {
    await this.prisma.recentSearch.deleteMany({ where: { userId } });
    return { message: 'Recent searches cleared' };
  }

  async removeRecentSearch(userId: string, id: string) {
    await this.prisma.recentSearch.deleteMany({ where: { id, userId } });
    return { message: 'Removed' };
  }
}
