import { Module } from '@nestjs/common';
import { AiAgentService } from '../services/ai-agent.service';
import { PrismaService } from '../services/prisma.service';
import { AiAgentController } from 'src/controllers/ai-agent.controller';

@Module({
  providers: [AiAgentService, PrismaService],
  controllers: [AiAgentController],
  exports: [AiAgentService],
})
export class AiAgentModule {}