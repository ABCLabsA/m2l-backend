import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CheckpointService } from "../services/checkpoint.service";
import { ApiResponseUtil } from "src/common/interfaces/api-response.interface";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CurrentUser } from "../decorators/user.decorator";

@Controller('api/checkpoint')
export class CheckpointController {
  constructor(private readonly checkpointService: CheckpointService) { }

  @ApiTags('checkpoint')
  @ApiBearerAuth()  
  @UseGuards(JwtAuthGuard)
  @Post('commit/:checkPointId')
  async commitCheckpoint(
    @CurrentUser('userId') userId: string,
    @Param('checkPointId') checkPointId: string,
    @Body() body: { content: string }) {
    try {
      const feedback = await this.checkpointService.userCommitCheckpoint(userId, checkPointId, body.content);
      console.log(feedback);
      return ApiResponseUtil.success(feedback);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Get('checkUserPassPoint/:chapterId')
  async checkuserPassPoint(
    @CurrentUser('userId') userId: string,
    @Param('chapterId') chapterId: string,
  ) {
    const feedback = await this.checkpointService.checkUserPassCheckpoint(userId, chapterId);
    return ApiResponseUtil.success(feedback);
  }
}