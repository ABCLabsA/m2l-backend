import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";
import { ApiResponse, ApiResponseUtil } from "src/common/interfaces/api-response.interface";
import { CurrentUser } from "src/decorators/user.decorator";
import { CourseBadgeResponseDto } from "src/dto/index.dto";
import { IndexService } from "src/services/index.service";

@Controller("api/index")
@ApiTags("index")
export class IndexController {
  constructor(private readonly indexService: IndexService) {}

  @Get("course-badge")
  @ApiOperation({ summary: '获取课程徽章' })
  @SwaggerApiResponse({ status: 200, description: '获取课程徽章成功', type: CourseBadgeResponseDto})
  async courseBadge(@CurrentUser("userId") userId: string): Promise<ApiResponse<CourseBadgeResponseDto[]>> {
    return ApiResponseUtil.success(await this.indexService.courseBadge(userId))
  }
}