import { Module } from '@nestjs/common';
import { AptosService } from 'src/services/aptos.service';
import { CourseService } from 'src/services/course.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
  imports: [PrismaService],
  providers: [AptosService, CourseService],
  exports: [AptosService],
})
export class AptosModule {}