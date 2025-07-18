import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { AptosService } from '../services/aptos.service';
import { AdminSignResponseDto, SignRequestDto, UpatdeCertificateDto } from 'src/dto/course-completion.dto';
import { CourseService } from 'src/services/course.service';
import { ApiResponse, ApiResponseUtil } from 'src/common/interfaces/api-response.interface';
import { CurrentUser } from 'src/decorators/user.decorator';


@ApiTags('contract')
@Controller('api/contract')
export class ContractAdminAuthController {
  constructor(
    private readonly aptosService: AptosService,
    private readonly courseService: CourseService
  ) { }

  @Post('sign')
  @ApiOperation({ summary: '获取课程非重复的nonce', description: '获取课程非重复的nonce' })
  @SwaggerApiResponse({ status: 200, description: '获取课程非重复的nonce', type: AdminSignResponseDto })
  async getNonceAndKey(@Body() body: SignRequestDto, @CurrentUser('userId') userId: string): Promise<ApiResponse<AdminSignResponseDto>> {
    const courseFinished = await this.courseService.checkCourseFinished(body.courseId, userId);
    if (!courseFinished) {
      return ApiResponseUtil.error(400, 'Course not finished');
    }
    const courseIssuedCertificate = await this.courseService.checkCertificateIssued(body.courseId, userId);
    if (courseIssuedCertificate) {
      return ApiResponseUtil.error(400, 'Certificate already issued');
    }
    const nonce = this.aptosService.generateNonce();
    const publicKey = this.aptosService.generatePublicKey(body, nonce);
    
    return ApiResponseUtil.success({
      nonce,
      publicKey
    });
  }

  @Post('update-certificate')
  @ApiOperation({ summary: '更新证书状态', description: '更新证书状态' })
  @ApiBody({ type: UpatdeCertificateDto })
  @SwaggerApiResponse({ status: 200, description: '更新证书状态' })
  async updateCertificate(@Body() body: UpatdeCertificateDto, @CurrentUser('userId') userId: string): Promise<ApiResponse<null>> {
    const courseId = body.courseId;
    const courseFinished = await this.courseService.checkCourseFinished(courseId, userId);
    if (!courseFinished) {
      return ApiResponseUtil.error(400, 'Course not finished');
    }
    await this.courseService.updateIssuedCertificateStatus(courseId, userId);
    return ApiResponseUtil.success(null);
  }

  // async adminSignTransaction(@Body() body: MultiAgentTransaction, @CurrentUser('userId') userId: string): Promise<ApiResponse<AccountAuthenticator>> {
  //   const courseId = body.rawTransaction.payload.arguments[0];
  //   const courseFinished = await this.courseService.checkCourseFinished(courseId, userId);
  //   if (!courseFinished) {
  //     return ApiResponseUtil.error(400, 'Course not finished');
  //   }
  //   const transaction = await this.aptosService.prepareCertificateTransaction(body.courseId, body.userAddress);
  //   const adminSigned = this.aptosService.adminSignTransaction(transaction);
  //   return ApiResponseUtil.success(adminSigned);
  // }

  /**
   * 序列化包含 BigInt 的对象
   * @param obj 要序列化的对象
   * @returns 序列化后的对象
   */
  private serializeBigInt(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value instanceof Uint8Array ? Array.from(value) : value
    ));
  }
}   