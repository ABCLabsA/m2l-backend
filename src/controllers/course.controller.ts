import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiResponse as SwaggerApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { CourseDetailDto, CourseDto } from '../dto/course.dto';
import { CourseTypeDto } from '../dto/shared.dto';
import { CurrentUser } from '../decorators/user.decorator';
import { Public } from '../decorators/public.decorator';
import { ApiResponse, ApiResponseUtil } from '../common/interfaces/api-response.interface';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('')
  @Public()
  @ApiOperation({ summary: '获取所有课程', description: '获取课程列表，可按类型筛选' })
  @ApiQuery({ name: 'type', required: false, description: '课程类型' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: [CourseDto] })
  async getAllCourses(@Query('typeId') typeId?: string, @CurrentUser('userId') userId?: string): Promise<ApiResponse<CourseDto[]>> {
    try {
      // 对于公开接口，userId可能为undefined，这是正常的
      const courses = await this.courseService.getCourseList(typeId, userId);
      return ApiResponseUtil.success(courses);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Get('buy/:id')
  @ApiOperation({ summary: '购买课程', description: '购买指定课程' })
  @ApiParam({ name: 'id', description: '课程ID' })
  @SwaggerApiResponse({ status: 200, description: '购买成功' })
  @SwaggerApiResponse({ status: 404, description: '课程不存在' })
  async buyCourse(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<ApiResponse<null>> {
    try {
      // 首先检查课程是否存在
      const course = await this.courseService.checkCourseExist(id);
      if (!course) {
        return ApiResponseUtil.error(404, 'Course not found');
      }

      await this.courseService.buyCourse(userId, id);
      return ApiResponseUtil.success(null);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Get('private-courses')
  @ApiOperation({ summary: '获取我的课程', description: '获取当前用户购买的课程列表' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: [CourseDto] })
  async getPrivateCourses(
    @CurrentUser('userId') userId: string,
  ): Promise<ApiResponse<CourseDto[]>> {
    try {
      const courses = await this.courseService.getPrivateCourseList(userId);
      return ApiResponseUtil.success(courses);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Get('types')
  @ApiOperation({ summary: '获取课程类型', description: '获取所有课程类型列表' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: [CourseTypeDto] })
  async getCourseTypes(): Promise<ApiResponse<CourseTypeDto[]>> {
    try {
      const courseTypes = await this.courseService.getCourseTypeList();
      return ApiResponseUtil.success(courseTypes);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取课程详情', description: '根据ID获取课程详细信息' })
  @ApiParam({ name: 'id', description: '课程ID' })
  @SwaggerApiResponse({ status: 200, description: '获取成功', type: CourseDetailDto })
  @SwaggerApiResponse({ status: 404, description: '课程不存在' })
  async getCourseById(@Param('id') id: string, @CurrentUser('userId') userId?: string): Promise<ApiResponse<CourseDetailDto>> {
    try {
      const course = await this.courseService.getCourseDetail(id, userId);
      if (!course) {
        return ApiResponseUtil.error(404, 'Course not found');
      }
      return ApiResponseUtil.success(course);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }

  @Post('issue-certificate')
  @ApiOperation({ summary: '发放证书', description: '发放指定课程的证书' })
  @ApiParam({ name: 'id', description: '课程ID' })
  @SwaggerApiResponse({ status: 200, description: '发放成功' })
  @SwaggerApiResponse({ status: 404, description: '课程不存在' })
  async issueCertificate(@Param('id') id: string, @CurrentUser('userId') userId: string): Promise<ApiResponse<null>> {
    const courseFinished = await this.courseService.checkCourseFinished(id, userId);
    if (!courseFinished) {
      return ApiResponseUtil.error(400, 'Course not finished');
    }
    const certificateIssued = await this.courseService.checkCertificateIssued(id, userId);
    if (certificateIssued) {
      return ApiResponseUtil.error(400, 'Certificate already issued');
    }
    try {
      await this.courseService.updateIssuedCertificateStatus(id, userId);
      return ApiResponseUtil.success(null);
    } catch (error) {
      return ApiResponseUtil.error(500, error.message);
    }
  }
} 