import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addFavorite(userId: string, dto: CreateFavoriteDto) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_lat_lon: { userId, lat: dto.lat, lon: dto.lon } },
    });
    if (existing) throw new ConflictException('City already in favorites');

    return this.prisma.favorite.create({
      data: { userId, ...dto },
    });
  }

  async removeFavorite(userId: string, favoriteId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id: favoriteId },
    });
    if (!favorite || favorite.userId !== userId) {
      throw new NotFoundException('Favorite not found');
    }
    await this.prisma.favorite.delete({ where: { id: favoriteId } });
    return { message: 'Removed from favorites' };
  }
}
