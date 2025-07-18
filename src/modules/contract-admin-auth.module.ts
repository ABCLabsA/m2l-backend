import { Module } from '@nestjs/common';
import { ContractAdminAuthController } from '../controllers/contract-admin-auth.controller';
import { AptosService } from '../services/aptos.service';
import { PrismaService } from '../services/prisma.service';
import { CourseService } from '../services/course.service';

@Module({
  controllers: [ContractAdminAuthController],
  providers: [AptosService, PrismaService, CourseService],
  exports: [AptosService],
})
export class ContractAdminAuthModule {} 