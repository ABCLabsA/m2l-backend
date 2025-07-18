import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthModule } from './modules/auth.module';
import { CourseModule } from './modules/course.module';
import { ChapterModule } from './modules/chapter.module';
import { MoveModule } from './modules/move.module';
import { ContractAdminAuthModule } from './modules/contract-admin-auth.module';
import { UserProgressModule } from './modules/userProgress.module';
import { IndexModule } from './modules/index.module';
import { CheckpointModule } from './modules/checkpoint.module';
import { AiAgentModule } from './modules/ai-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CourseModule,
    ChapterModule,
    MoveModule,
    ContractAdminAuthModule,
    UserProgressModule,
    IndexModule,
    CheckpointModule,
    AiAgentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
