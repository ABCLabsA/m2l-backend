import { Module } from "@nestjs/common";
import { CheckpointController } from "../controllers/checkpoint.controller";
import { CheckpointService } from "../services/checkpoint.service";
import { PrismaService } from "../services/prisma.service";
import { MoveModule } from "./move.module";

@Module({
  imports: [MoveModule],
  controllers: [CheckpointController],
  providers: [CheckpointService, PrismaService],
  exports: [CheckpointService],
})
export class CheckpointModule {}