import { Module } from '@nestjs/common';
import { RecentSearchesController } from './recent-searches.controller';
import { RecentSearchesService } from './recent-searches.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [RecentSearchesController],
  providers: [RecentSearchesService, PrismaService],
})
export class RecentSearchesModule {}
