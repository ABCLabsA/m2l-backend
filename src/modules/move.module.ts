import { Module } from '@nestjs/common';
import { MoveController } from '../controllers/move.controller';
import { MoveService } from '../services/move.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [MoveController],
  providers: [MoveService, PrismaService],
  exports: [MoveService],
})
export class MoveModule {} 