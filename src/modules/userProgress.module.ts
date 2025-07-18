import { Module } from '@nestjs/common';
import { UserProgressController } from '../controllers/user-progress.controller';
import { UserProgressService } from '../services/userProgress.service';
import { PrismaService } from '../services/prisma.service';
import { CertificateIntegrationService } from '../services/certificate-integration.service';
import { AptosService } from '../services/aptos.service';

@Module({
  controllers: [UserProgressController],
  providers: [UserProgressService, PrismaService, CertificateIntegrationService, AptosService],
  exports: [UserProgressService],
})
export class UserProgressModule {}