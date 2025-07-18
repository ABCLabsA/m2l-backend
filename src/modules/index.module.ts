import { Module } from "@nestjs/common";
import { IndexController } from "src/controllers/index.controller";
import { PrismaService } from "src/services/prisma.service";
import { IndexService } from "src/services/index.service";
import { AptosService } from "src/services/aptos.service";

@Module({
  imports: [],
  controllers: [IndexController],
  providers: [IndexService, PrismaService, AptosService],
})
export class IndexModule {}