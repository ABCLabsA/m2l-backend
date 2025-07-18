import { Controller, Get, Post, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";
import { UserProgressService } from "../services/userProgress.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CurrentUser } from "../decorators/user.decorator";
import { ApiResponse, ApiResponseUtil } from "../common/interfaces/api-response.interface";
import { UserProgressDto } from "../dto/user-progress.dto";
import { UpdateProgressDto } from "../dto/update-progress.dto";
import { MultiAgentTransaction } from "@aptos-labs/ts-sdk";


@Controller('api/progress')
@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Get('/:courseId')
  @ApiOperation({ summary: '获取用户课程进度', description: '根据课程ID获取当前用户的学习进度' })
  @ApiParam({ name: 'courseId', description: '课程ID' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: UserProgressDto })
  @SwaggerApiResponse({ status: 404, description: '进度记录未找到' })
  async getProgress(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<ApiResponse<UserProgressDto>> {
    try {
      const progress = await this.userProgressService.getProgressByCourseAndUser(courseId, userId);
      return ApiResponseUtil.success(progress);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return ApiResponseUtil.error(404, error.message);
      }
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Post('/update')
  @ApiOperation({ summary: '更新学习进度', description: '更新用户的章节学习进度' })
  @ApiBody({ type: UpdateProgressDto })
  @SwaggerApiResponse({ status: 200, description: '更新成功', type: UserProgressDto })
  @SwaggerApiResponse({ status: 400, description: '更新失败' })
  async updateProgress(
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApiResponse<UserProgressDto>> {
    try {
      const progress = await this.userProgressService.updateProgress(updateProgressDto.chapterId, updateProgressDto.courseId, userId);
      return ApiResponseUtil.success(progress);
    } catch (error) {
      return ApiResponseUtil.error(400, error.message);
    }
  }

  @Post('/finish')
  @ApiOperation({ summary: '完成课程', description: '标记课程完成并发放证书' })
  @ApiBody({ type: UpdateProgressDto })
    @SwaggerApiResponse({ status: 200, description: '课程完成', type: UserProgressDto })
  @SwaggerApiResponse({ status: 400, description: '操作失败' })
  async finishedCourse(
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApiResponse<UserProgressDto>> {
    try {
      const result = await this.userProgressService.finishCourseProgress(updateProgressDto.chapterId, updateProgressDto.courseId, userId);
      return ApiResponseUtil.success(result);
    } catch (error) {
      return ApiResponseUtil.error(400, error.message);
    } 
  }
}