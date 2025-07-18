import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ChapterService } from '../services/chapter.service';
import { ChapterDto } from '../dto/chapter.dto';
import { ApiResponse, ApiResponseUtil } from '../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/user.decorator';

@ApiTags('chapters')
@ApiBearerAuth()
@Controller('api/chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get('/')
  @ApiOperation({ summary: '获取所有章节', description: '获取所有章节列表' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: [ChapterDto] })
  async getAllChapters(): Promise<ApiResponse<ChapterDto[]>> {
    try {
      const chapters = await this.chapterService.getAllChapters();
      return ApiResponseUtil.success(chapters);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取章节详情', description: '根据ID获取章节详细信息' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: ChapterDto })
  @SwaggerApiResponse({ status: 404, description: '章节不存在' })
  @SwaggerApiResponse({ status: 403, description: '无权限访问，需要完成前置章节' })
  async getChapterById(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<ApiResponse<ChapterDto>> {
    try {
      const chapter = await this.chapterService.getChapter(id);
      if (!chapter) { 
        return ApiResponseUtil.error(404, 'Chapter not found');
      }

      const ableToAccess = await this.chapterService.ableToAccessChapter(id, userId);
      
      if (!ableToAccess) {
        return ApiResponseUtil.error(403, 'You have not completed the previous chapter, please complete it first');
      }

      return ApiResponseUtil.success(chapter);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }
} 