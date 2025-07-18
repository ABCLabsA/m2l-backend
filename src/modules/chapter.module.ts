import { Module } from '@nestjs/common';
import { ChapterController } from '../controllers/chapter.controller';
import { ChapterService } from '../services/chapter.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [ChapterController],
  providers: [ChapterService, PrismaService],
  exports: [ChapterService],
})
export class ChapterModule {} 